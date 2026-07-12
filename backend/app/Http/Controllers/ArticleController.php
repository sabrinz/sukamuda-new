<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleView; 
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
    private function formatImageUrl($imagePath)
    {
        if (empty($imagePath) || !is_string($imagePath)) {
            return null;
        }

        // kalau sudah URL
        if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
            // ubah localhost ke domain hosting
            $imagePath = str_replace(
                'http://127.0.0.1:8000',
                'https://sukamuda.co.id',
                $imagePath
            );
            return $imagePath;
        }

        return 'https://sukamuda.co.id/storage/' . ltrim($imagePath, '/');
    }

    private function transformArticles($articles)
    {
        $articles->getCollection()->transform(function ($article) {
            $article->image = $this->formatImageUrl($article->image);
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
            ->select('id', 'title', 'slug', 'image', 'video_link', 'user_id', 'category')
            ->with('user:id,name,avatar')
            ->latest()
            ->get();

        foreach ($articles as $article) {
            $article->image = $this->formatImageUrl($article->image);
        }

        return response()->json($articles);
    }

    public function getPublicArticles(Request $request)
    {
        $user = $request->user('sanctum');
        
        $query = Article::where('status', 'approved')
            ->select(['id', 'user_id', 'title', 'slug', 'image', 'summary', 'content', 'category', 'created_at'])
            ->with('user:id,name,avatar')
            ->withCount('likes');

        if ($user) {
            $query->withExists(['likes as is_liked_by_user' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]);
        }

        $articles = $query->latest()->paginate(50);
        
        $articles->getCollection()->transform(function ($article) {
            $article->image = $this->formatImageUrl($article->image);
            return $article;
        });

        return response()->json($articles->items())
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'         => 'required|string|max:255',
            'category'      => 'required|string',
            'summary'       => 'nullable|string|max:500',
            'content'       => 'required|string',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'image_caption' => 'nullable|string|max:255',
            'audio_link'    => 'nullable|string|max:500',
            'video_link'    => 'nullable|string|max:500',
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
            'slug'          => Article::generateUniqueSlug($request->title),
            'category'      => $request->category,
            'summary'       => $request->summary,
            'content'       => $request->content,
            'image'         => $imagePath,
            'image_caption' => $request->image_caption,
            'audio_link'    => $request->audio_link,
            'video_link'    => $request->video_link,
            'status'        => $finalStatus,
            'tags'          => $request->tags,
            'views'         => 0
        ]);

        $article->image = $this->formatImageUrl($article->image);

        Cache::flush();
        return response()->json(['message' => 'Berita berhasil dibuat!', 'data' => $article], 201);
    }

    public function showBySlug(Request $request, string $slug)
    {
        $user = $request->user('sanctum');

        $article = $this->buildArticleDetailQuery($user)->where('slug', $slug)->first();

        if (!$article && preg_match('/^(.+)-\d{10,}$/', $slug, $matches)) {
            $cleanSlug = $matches[1];
            $article = $this->buildArticleDetailQuery($user)->where('slug', $cleanSlug)->first();
            
            if ($article) {
                $article->update(['slug' => $cleanSlug]);
            }
        }

        if (!$article && ctype_digit($slug)) {
            $article = $this->buildArticleDetailQuery($user)->where('id', (int) $slug)->first();
        }

        if (!$article) {
            return response()->json(['message' => 'Artikel tidak ditemukan'], 404);
        }

        $article->image = $this->formatImageUrl($article->image);

        return response()->json(['data' => $article]);
    }

    private function buildArticleDetailQuery($user)
    {
        $query = Article::with('user')->withCount('likes');

        if ($user) {
            $query->withExists(['likes as is_liked_by_user' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]);
        }

        return $query;
    }

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
            'image_caption' => 'nullable|string|max:255',
            'audio_link'    => 'nullable|string|max:500',
            'video_link'    => 'nullable|string|max:500',
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
        $article->image_caption = $request->image_caption;
        $article->audio_link = $request->audio_link;
        $article->video_link = $request->video_link;
        $article->slug = Article::generateUniqueSlug($request->title, $article->id);
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

        $article->status = $request->status;
        
        if ($request->status === 'rejected') {
            $article->rejection_reason = $request->rejection_reason;
        }
        
        $article->save();

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
            $like = ArticleLike::create(['user_id' => $user->id, 'article_id' => $id]);
            $status = 'liked';

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
        try {
            $article = Article::findOrFail($id);
            $article->increment('views'); 

            return response()->json([
                'success' => true,
                'views' => $article->views,
                'message' => 'View count updated successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update view count: ' . $e->getMessage()
            ], 500);
        }
    }

    public function view(Request $request, $id)
    {
        $article = Article::findOrFail($id);
        
        $article->increment('views');
        
        ArticleView::create([
            'article_id' => $id,
            'ip_address' => $request->ip(),
            'user_id'    => $request->user('sanctum')?->id,
        ]);

        return response()->json([
            'views' => $article->fresh()->views,
            'is_new_view' => true,
        ]);
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

        $article->is_manual_trending = !$article->is_manual_trending;
        $article->save();
        
        Cache::forget('trending_weekly_real_7days_' . now()->format('Y-m-d'));

        return response()->json([
            'message' => 'Trending manual updated',
            'is_manual_trending' => $article->is_manual_trending
        ]);
    }

    public function shareRender(Request $request, $slug)
    {
        $article = Article::where('slug', $slug)->with('user')->firstOrFail();
        
        $reactBaseUrl = 'https://sukamuda.co.id';
        $articleUrl = rtrim($reactBaseUrl, '/') . '/article/' . $article->slug;

        $userAgent = $request->header('User-Agent', '');

        // POLA REGEX KETAT: Menyaring daftar bot crawler media sosial & search engine
        $botPattern = '/(facebookexternalhit|whatsapp|twitterbot|pinterest|googlebot|bingbot|yandexbot|yahoo|baiduspider|linkedinbot|embedly)/i';

        // JIKA BUKAN BOT (MANUSIA ASLI): Langsung dialihkan ke URL Frontend React
        if (!preg_match($botPattern, $userAgent)) {
            return redirect()->away($articleUrl);
        }

        // JIKA BOT CRAWLER: Sediakan pratinjau data meta dan JSON-LD
        if ($article->image) {
            $shareImage = $this->formatImageUrl($article->image);
        } else {
            $shareImage = 'https://sukamuda.co.id/images/default-placeholder.png';
        }

        $cleanDescription = Str::limit(
            strip_tags($article->summary ?? $article->content),
            150,
            '...'
        );

        // Skema Terstruktur JSON-LD standar Google News (Kompas / Detik)
        $schemaMarkup = [
            '@context' => 'https://schema.org',
            '@type' => 'NewsArticle',
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => $articleUrl,
            ],
            'headline' => $article->title,
            'description' => $cleanDescription,
            'image' => [
                $shareImage
            ],
            'datePublished' => $article->created_at?->toIso8601String() ?? now()->toIso8601String(),
            'dateModified' => $article->updated_at?->toIso8601String() ?? now()->toIso8601String(),
            'author' => [
                '@type' => 'Person',
                'name' => $article->user?->name ?? 'Redaksi SUKAMUDA',
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => 'SUKAMUDA',
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => 'https://sukamuda.co.id/images/logo.png'
                ]
            ]
        ];

        return view('article_share', [
            'shareTitle'       => $article->title . ' - SUKAMUDA',
            'shareDescription' => $cleanDescription,
            'shareUrl'         => url('/share/article/' . $article->slug),
            'shareImage'       => $shareImage,
            'articleUrl'       => $articleUrl,
            'schemaMarkup'     => json_encode($schemaMarkup, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
        ]);
    }

    public function trending()
    {
        $cacheKey = 'trending_weekly_real_7days_' . now()->format('Y-m-d');
        
        $articles = Cache::remember($cacheKey, now()->addHour(), function () {
            
            // Filter kueri kunjungan HANYA dalam rentang 7 hari ke belakang
            $oneWeekAgo = now()->subDays(7);
            
            $weeklyViews = ArticleView::where('created_at', '>=', $oneWeekAgo)
                ->select('article_id', DB::raw('COUNT(*) as total_views'))
                ->groupBy('article_id')
                ->pluck('total_views', 'article_id')
                ->toArray();

            $articles = Article::where('status', 'approved')
                ->where(function ($query) {
                    $query->whereNull('is_ever_trending')
                          ->orWhere('is_ever_trending', 0)
                          ->orWhere('is_manual_trending', 1);
                })
                ->select([
                    'id', 'user_id', 'title', 'slug', 'image', 
                    'summary', 'category', 'created_at', 'views',
                    'is_ever_trending', 'is_manual_trending'
                ])
                ->with('user:id,name')
                ->get();

            $articles = $articles->map(function ($article) use ($weeklyViews) {
                $article->weekly_views = $weeklyViews[$article->id] ?? 0;
                return $article;
            })->sortByDesc('weekly_views')->take(5);

            foreach ($articles as $article) {
                if (!$article->is_manual_trending) {
                    DB::table('articles')->where('id', $article->id)->update(['is_ever_trending' => 1]);
                    $article->is_ever_trending = 1;
                }
                $article->image = $this->formatImageUrl($article->image);
            }
            
            return $articles->values();
        });

        return response()->json($articles);
    }
}