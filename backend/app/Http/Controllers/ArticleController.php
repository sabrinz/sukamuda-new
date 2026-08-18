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
    /**
     * PERBAIKAN: Dipastikan mengembalikan domain utama HTTPS absolut agar thumbnail valid
     */
    private function formatImageUrl($imagePath)
    {
        if (empty($imagePath) || !is_string($imagePath)) {
            return 'https://sukamuda.co.id/images/default-placeholder.png';
        }

        // kalau sudah URL
        if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {

            // ubah localhost ke domain hosting utama
            $imagePath = str_replace(
                ['http://127.0.0.1:8000', 'https://api.sukamuda.co.id'],
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
            ->with('user:id,name,avatar,profession,school_name')
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
            // Menambahkan 'content' jika kamu pakai cara bypass cPanel sementara
            ->select(['id', 'user_id', 'title', 'slug', 'image', 'image_caption', 'summary', 'content', 'category', 'created_at', 'updated_at', 'status', 'views', 'tags', 'audio_link', 'video_link'])
            ->with('user:id,name,avatar,bio,profession,school_name')
            ->withCount('likes');

        if ($user) {
            $query->withExists(['likes as is_liked_by_user' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]);
        }

        $articles = $query->latest()->paginate(500);
        
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

        // KEAMANAN: hanya admin yang boleh langsung approve.
        // User biasa maksimal draft/pending, apapun yang dia kirim.
        if ($user->role === 'admin') {
            $finalStatus = in_array($request->status, ['draft', 'pending', 'approved']) ? $request->status : 'approved';
        } else {
            $finalStatus = ($request->status === 'draft') ? 'draft' : 'pending';
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
        // KEAMANAN: hanya admin yang boleh set status apa pun.
        // Penulis hanya boleh draft (simpan) atau pending (ajukan review).
        if ($request->has('status')) {
            if ($user->role === 'admin') {
                $article->status = $request->status;
            } elseif (in_array($request->status, ['draft', 'pending'])) {
                $article->status = $request->status;
            }
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
        
        Cache::forget('trending_weekly_v2_' . now()->startOfWeek()->format('Y-m-d'));

        return response()->json([
            'message' => 'Trending manual updated',
            'is_manual_trending' => $article->is_manual_trending
        ]);
    }

    /**
     * PERBAIKAN TOTAL: Validasi Bot via Regex Keras & Mengirim JSON-LD Schema Struktural
     */
    public function shareRender(Request $request, $slug)
    {
        $article = Article::where('slug', $slug)->with('user')->firstOrFail();

        $reactBaseUrl = 'https://sukamuda.co.id'; 
        $articleUrl = rtrim($reactBaseUrl, '/') . '/article/' . $article->slug;

        // 1. Ambil info pengakses via User-Agent header
        $userAgent = $request->header('User-Agent', '');

        // 2. VALIDASI BOT VIA REGEX KETAT: Menyaring bot pencari & crawler media sosial
        $botPattern = '/(facebookexternalhit|whatsapp|twitterbot|pinterest|googlebot|bingbot|yandexbot|yahoo|baiduspider|linkedinbot|embedly)/i';

        // 3. JIKA MANUSIA ASLI: Langsung arahkan (redirect) ke portal utama React
        if (!preg_match($botPattern, $userAgent)) {
            return redirect()->away($articleUrl);
        }

        // 4. JIKA BOT CRAWLER: Sediakan tautan gambar HTTPS absolut & Schema Data Terstruktur
        $shareImage = $this->formatImageUrl($article->image);

        $cleanDescription = Str::limit(
            strip_tags($article->summary ?? $article->content),
            150,
            '...'
        );

        // Schema Markup JSON-LD terstruktur standar Google News
        $schemaMarkup = [
            '@context' => 'https://schema.org',
            '@type' => 'NewsArticle',
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => $articleUrl,
            ],
            'headline' => $article->title,
            'description' => $cleanDescription,
            'image' => [$shareImage],
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
            'shareUrl'         => url('/api/share/article/' . $article->slug),
            'shareImage'       => $shareImage,
            'articleUrl'       => $articleUrl,
            'schemaMarkup'     => json_encode($schemaMarkup, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
        ]);
    }

    // --- FUNGSI TRENDING BAWAAN CPANEL DIJAGA TETAP UTUH ---
    public function trending()
    {
        $cacheKey = 'trending_weekly_v2_' . now()->startOfWeek()->format('Y-m-d');

        $articles = Cache::remember($cacheKey, now()->addHour(), function () {
            $startOfWeek = now()->startOfWeek();

            $weeklyViewsSubquery = ArticleView::where('viewed_at', '>=', $startOfWeek)
                ->select('article_id', DB::raw('COUNT(*) as total_views'))
                ->groupBy('article_id');

            return Article::query()
                ->leftJoinSub($weeklyViewsSubquery, 'weekly_views', function ($join) {
                    $join->on('articles.id', '=', 'weekly_views.article_id');
                })
                ->leftJoin('users', 'articles.user_id', '=', 'users.id')
                ->where('articles.status', 'approved')
                ->orderByDesc(DB::raw('COALESCE(weekly_views.total_views, 0)'))
                ->orderByDesc('articles.created_at')
                ->limit(5)
                ->get([
                    'articles.id',
                    'articles.user_id',
                    'articles.title',
                    'articles.slug',
                    'articles.image',
                    'articles.summary',
                    'articles.category',
                    'articles.created_at',
                    'articles.views',
                    DB::raw('COALESCE(weekly_views.total_views, 0) as weekly_views'),
                    DB::raw('users.name as author_name'),
                    DB::raw('users.avatar as author_avatar'),
                ])
                ->map(function ($article) {
                    $article->image = $this->formatImageUrl($article->image);

                    return [
                        'id' => $article->id,
                        'user_id' => $article->user_id,
                        'title' => $article->title,
                        'slug' => $article->slug,
                        'image' => $article->image,
                        'summary' => $article->summary,
                        'category' => $article->category,
                        'created_at' => $article->created_at,
                        'views' => $article->views,
                        'weekly_views' => (int) $article->weekly_views,
                        'author_name' => $article->author_name,
                        'author_avatar' => $article->author_avatar,
                        'user' => $article->author_name ? [
                            'id' => $article->user_id,
                            'name' => $article->author_name,
                            'avatar' => $article->author_avatar,
                        ] : null,
                    ];
                })
                ->values();
        });

        return response()->json($articles);
    }
}