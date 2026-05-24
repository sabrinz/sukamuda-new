<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Comment;
use App\Models\ArticleLike;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ArticleController extends Controller
{
    /**
     * Helper untuk mengubah path gambar menjadi URL lengkap
     */
    private function transformArticles($articles)
    {
        $articles->getCollection()->transform(function ($article) {
            if ($article->image) {
                if (!filter_var($article->image, FILTER_VALIDATE_URL)) {
                    $article->image = asset('storage/' . $article->image);
                }
            }
            return $article;
        });
        return $articles;
    }

    public function index(Request $request)
    {
        $query = Article::with('user')->withCount('likes');

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                try {
                    $q->whereFullText('title', $search);
                } catch (\Exception $e) {
                    $q->where('title', 'LIKE', "%{$search}%");
                }
                $q->orWhereHas('user', function($u) use ($search) {
                    $u->where('name', 'LIKE', "%{$search}%");
                });
            });
        }

        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('category') && $request->category != 'all') {
            $query->where('category', $request->category);
        }

        $articles = $query->latest()->paginate(15);
        return response()->json($this->transformArticles($articles));
    }

    public function listByCategory(Request $request, $category)
    {
        $articles = Article::where('category', $category)
            ->where('status', 'approved')
            ->select('id', 'title')
            ->latest()
            ->get();

        return response()->json($articles);
    }

    public function getPublicArticles(Request $request)
    {
        $user = $request->user('sanctum');
        $query = Article::where('status', 'approved')->with('user')->withCount('likes');

        if ($user) {
            $query->withExists(['likes as is_liked_by_user' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]);
        }

        $articles = $query->latest()->paginate(50);
        $this->transformArticles($articles);
        return response()->json($articles->items())->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    /**
     * FUNGSI SIMPAN ARTIKEL BARU
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'         => 'required|string|max:255',
            'category'      => 'required|string',
            'summary'       => 'nullable|string|max:500',
            'content'       => 'required|string',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'image_caption' => 'nullable|string|max:255', // TAMBAHKAN INI
            'status'        => 'nullable|string|in:draft,review,published,approved,pending'
        ]);

        $user = $request->user();
        $imagePath = $request->hasFile('image') ? $request->file('image')->store('articles', 'public') : null;

        $finalStatus = $request->status;
        if (!$finalStatus || $finalStatus === 'published' || $finalStatus === 'review') {
            $finalStatus = ($user->role === 'admin') ? 'approved' : 'pending';
        }

        $article = Article::create([
            'user_id'       => $user->id,
            'title'         => $request->title,
            'slug'          => Str::slug($request->title) . '-' . time(),
            'category'      => $request->category,
            'summary'       => $request->summary,
            'content'       => $request->content,
            'image'         => $imagePath,
            'image_caption' => $request->image_caption, // TAMBAHKAN INI
            'status'        => $finalStatus,
            'tags'          => $request->tags,
            'views'         => 0
        ]);

        if ($article->image) {
            $article->image = asset('storage/' . $article->image);
        }

        Cache::flush();
        return response()->json(['message' => 'Berita berhasil dibuat!', 'data' => $article], 201);
    }

    /**
     * FUNGSI UPDATE ARTIKEL
     */
    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);
        $user = $request->user();

        if ($article->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title'         => 'required|string|max:255',
            'category'      => 'required|string',
            'summary'       => 'nullable|string|max:500',
            'content'       => 'required|string',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'image_caption' => 'nullable|string|max:255', // TAMBAHKAN INI
            'status'        => 'nullable|string'
        ]);

        if ($request->hasFile('image')) {
            if ($article->image) {
                Storage::disk('public')->delete($article->image);
            }
            $article->image = $request->file('image')->store('articles', 'public');
        }

        $article->title = $request->title;
        $article->category = $request->category;
        $article->summary = $request->summary;
        $article->content = $request->content;
        $article->tags = $request->tags;
        $article->image_caption = $request->image_caption; // TAMBAHKAN INI
        
        if ($request->has('status')) {
            $article->status = $request->status;
        }

        $article->save();
        Cache::flush();

        return response()->json(['message' => 'Berita berhasil diperbarui!', 'data' => $article]);
    }

    public function updateStatus(Request $request, $id)
    {
        $article = Article::findOrFail($id);
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|string|in:approved,rejected,pending',
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        $oldStatus = $article->status;
        $article->status = $request->status;
        
        // Simpan alasan penolakan jika status rejected
        if ($request->status === 'rejected') {
            $article->rejection_reason = $request->rejection_reason;
        }
        
        $article->save();

        // Buat notifikasi untuk penulis artikel
        $articleTitle = $article->title;
        
        if ($request->status === 'approved') {
            $message = "Artikel anda yang berjudul \"{$articleTitle}\" telah disetujui oleh admin sukamuda";
            $notificationType = 'article_approved';
        } else if ($request->status === 'rejected') {
            $message = "Artikel anda yang berjudul \"{$articleTitle}\" telah ditolak oleh admin sukamuda";
            $notificationType = 'article_rejected';
        } else {
            $message = "Artikel anda yang berjudul \"{$articleTitle}\" sedang dalam review";
            $notificationType = 'article_pending';
        }

        Notification::create([
            'user_id' => $article->user_id,
            'article_id' => $article->id,
            'triggered_by_user_id' => $user->id,
            'type' => $notificationType,
            'message' => $message,
            'rejection_reason' => $request->rejection_reason ?? null,
        ]);

        Cache::flush();

        return response()->json(['message' => 'Status berita berhasil diperbarui!', 'data' => $article]);
    }

    public function trashIndex(Request $request)
    {
        $query = Article::onlyTrashed()->with('user');

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                try {
                    $q->whereFullText('title', $search);
                } catch (\Exception $e) {
                    $q->where('title', 'LIKE', "%{$search}%");
                }
                $q->orWhereHas('user', function($u) use ($search) {
                    $u->where('name', 'LIKE', "%{$search}%");
                });
            });
        }

        if ($request->has('category') && $request->category != 'all') {
            $query->where('category', $request->category);
        }

        $articles = $query->latest()->paginate(15);
        return response()->json($this->transformArticles($articles));
    }

    public function restore(Request $request, $id)
    {
        $article = Article::onlyTrashed()->findOrFail($id);
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $article->restore();
        $article->status = 'pending';
        $article->rejection_reason = null;
        $article->save();

        Cache::flush();

        return response()->json(['message' => 'Artikel berhasil dipulihkan ke pending!', 'data' => $article]);
    }

    public function forceDelete(Request $request, $id)
    {
        $article = Article::onlyTrashed()->findOrFail($id);
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($article->image) {
            Storage::disk('public')->delete($article->image);
        }

        $article->forceDelete();
        Cache::flush();

        return response()->json(['message' => 'Artikel berhasil dihapus permanen dari sampah!']);
    }

    // --- Sisanya Fungsi Like, Comment, dll (Tetap Sama) ---
    public function toggleLike(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $article = Article::findOrFail($id);
        $like = ArticleLike::where('user_id', $user->id)->where('article_id', $id)->first();
        
        if ($like) {
            $like->delete();
            $status = 'unliked';
        } else {
            ArticleLike::create(['user_id' => $user->id, 'article_id' => $id]);
            $status = 'liked';

            // Buat notifikasi jika like (jangan untuk unlike)
            // Jangan kirim notifikasi ke user sendiri
            if ($article->user_id !== $user->id) {
                $message = "{$user->name} menyukai artikel anda yang berjudul \"{$article->title}\"";
                
                Notification::create([
                    'user_id' => $article->user_id,
                    'article_id' => $article->id,
                    'triggered_by_user_id' => $user->id,
                    'type' => 'article_liked',
                    'message' => $message,
                    'triggered_by_user_name' => $user->name,
                ]);
            }
        }

        $likesCount = ArticleLike::where('article_id', $id)->count();

        return response()->json([
            'message' => 'Success',
            'status' => $status,
            'likes_count' => $likesCount
        ]);
    }
    
    public function incrementView($id)
    {
        $article = Article::findOrFail($id);
        $article->increment('views');
        return response()->json(['views' => $article->views]);
    }

    public function destroy(Request $request, $id)
    {
        $article = Article::findOrFail($id);
        if ($article->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $article->delete();
        Cache::flush();
        return response()->json(['message' => 'Artikel berhasil dipindahkan ke sampah!']);
    }
    public function toggleTrending($id)
    {
        $article = Article::findOrFail($id);

        $article->is_trending = !$article->is_trending;
        $article->save();

        Cache::flush();

        return response()->json([
            'message' => 'Trending updated',
            'is_trending' => $article->is_trending
        ]);
    }

    public function trending()
    {
        $articles = Article::where('status', 'approved')
            ->where('is_trending', true)
            ->with('user')
            ->latest()
            ->take(5)
            ->get();

        return response()->json($articles);
    }
}

