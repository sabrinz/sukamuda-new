<?php

use Illuminate\Support\Facades\Route;
use App\Models\Article;
use Illuminate\Support\Str;
use App\Http\Controllers\SeoController;

Route::get('/', function () {
    return response()->json(['status' => 'SukaMuda Web Server is Online']);
});

Route::get('/article/{slug}', function (string $slug) {
    
    $userAgent = request()->userAgent() ?? '';
    
    // PERBAIKAN: Memastikan semua bot uji coba ikut tersaring
    $botPattern = '/(googlebot|bingbot|yandexbot|baiduspider|twitterbot|facebookexternalhit|facebook|whatsapp|telegrambot|linkedinbot|embedly|slackbot|vkShare|bot|crawler|spider|lighthouse|pingdom|validator|parser|screenshot|microlink)/i';
    $isBot = (bool) preg_match($botPattern, $userAgent);

    // PENYESUAIAN PENTING: Jika bukan bot (manusia), arahkan ke URL Frontend. 
    // Jangan pernah melakukan response()->file('index.php') karena akan membocorkan kode PHP Anda!
    if (!$isBot) {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'https://sukamuda.co.id'), '/');
        // Jika frontend ada di domain berbeda, langsung alihkan manusia ke sana
        return redirect()->away($frontendUrl . '/article/' . $slug);
    }

    $frontendUrl = rtrim(env('FRONTEND_URL', 'https://sukamuda.co.id'), '/');

    $article = Article::with('user')
        ->where('slug', $slug)
        ->where('status', 'approved')
        ->first();

    // JIKA ARTIKEL TIDAK ADA / FALLBACK BERANDA
    if (!$article) {
        $defaultDesc = 'Portal berita resmi, informasi literasi anak muda, dan wadah kreativitas terpercaya yang dirancang khusus untuk generasi muda Indonesia.';
        return response()->view('article_share', [
            'shareTitle'       => 'SukaMuda - Portal Berita Anak Muda',
            'shareDescription' => $defaultDesc,
            'shareImage'       => 'https://sukamuda.co.id/images/default-placeholder.png',
            'shareUrl'         => $frontendUrl . '/article/' . $slug,
            'articleUrl'       => $frontendUrl,
            'publishDate'      => now()->toIso8601String(),
            'schemaMarkup'     => json_encode([], JSON_UNESCAPED_SLASHES)
        ]);
    }
    
    $shareTitle = $article->title . ' - SUKAMUDA';
    
    // Mengambil deskripsi dari artikel asli
    $rawDescription = $article->summary ? strip_tags($article->summary) : strip_tags($article->content ?? '');
    $shareDescription = Str::limit($rawDescription, 140, '...');
    
    // Proteksi jika deskripsi artikel aslinya terlalu pendek
    if (strlen($shareDescription) < 90) {
        $shareDescription = 'Portal berita resmi, informasi literasi anak muda, dan wadah kreativitas terpercaya yang dirancang khusus untuk generasi muda Indonesia.';
    }

    // URL Gambar HTTPS Absolut menunjuk ke domain utama frontend
    $imageUrl = 'https://sukamuda.co.id/images/default-placeholder.png';
    if ($article->image) {
        if (filter_var($article->image, FILTER_VALIDATE_URL)) {
            $imageUrl = Str::replaceFirst('http://', 'https://', $article->image);
            $imageUrl = str_replace('https://api.sukamuda.co.id', 'https://sukamuda.co.id', $imageUrl);
        } else {
            $imageUrl = 'https://sukamuda.co.id/storage/' . ltrim($article->image, '/');
        }
    }

    // Fallback ambil Thumbnail YouTube jika Podcast Video
    if (($imageUrl === 'https://sukamuda.co.id/images/default-placeholder.png') && $article->video_link) {
        $videoId = null;
        $videoUrl = trim($article->video_link);
        try {
            $parsed = parse_url($videoUrl);
            if (is_array($parsed)) {
                $host = strtolower($parsed['host'] ?? '');
                $path = $parsed['path'] ?? '';
                $query = [];
                if (isset($parsed['query'])) { parse_str($parsed['query'], $query); }
                if (str_contains($host, 'youtu.be')) { $videoId = ltrim($path, '/'); } 
                elseif (str_contains($host, 'youtube.com')) {
                    if (str_starts_with($path, '/watch')) { $videoId = $query['v'] ?? null; }
                    elseif (str_starts_with($path, '/embed/')) { $videoId = basename($path); }
                    elseif (str_starts_with($path, '/shorts/')) { $videoId = basename($path); }
                }
            }
        } catch (\Throwable $e) {}
        if ($videoId) { $imageUrl = 'https://img.youtube.com/vi/' . $videoId . '/hqdefault.jpg'; }
    }

    $articleUrl = $frontendUrl . '/article/' . $slug;
    $articleDate = $article->created_at?->toIso8601String() ?? now()->toIso8601String();

    $schemaMarkup = [
        '@context' => 'https://schema.org',
        '@type' => 'NewsArticle',
        'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $articleUrl],
        'headline' => $article->title,
        'description' => $shareDescription,
        'image' => [$imageUrl],
        'datePublished' => $articleDate,
        'dateModified' => $article->updated_at?->toIso8601String() ?? now()->toIso8601String(),
        'author' => ['@type' => 'Person', 'name' => $article->user?->name ?? 'Redaksi SUKAMUDA'],
        'publisher' => [
            '@type' => 'Organization',
            'name' => 'SUKAMUDA',
            'logo' => ['@type' => 'ImageObject', 'url' => 'https://sukamuda.co.id/images/logo.png']
        ]
    ];

    return response()->view('article_share', [
        'shareTitle'       => $shareTitle,
        'shareDescription' => $shareDescription,
        'shareImage'       => $imageUrl,
        'shareUrl'         => $articleUrl,
        'articleUrl'       => $articleUrl,
        'publishDate'      => $articleDate,
        'schemaMarkup'     => json_encode($schemaMarkup, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
    ]);
})->where('slug', '[a-zA-Z0-9\-]+');

// Jalur bypass login
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

// Route pembersih internal cPanel (WAJIB pakai kunci rahasia: set CACHE_CLEAR_KEY di .env)
Route::get('/bersihkan-cache/{key}', function(string $key) {
    abort_unless(!empty(env('CACHE_CLEAR_KEY')) && hash_equals(env('CACHE_CLEAR_KEY'), $key), 404);
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    \Illuminate\Support\Facades\Artisan::call('route:clear');
    \Illuminate\Support\Facades\Artisan::call('view:clear');
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    return response()->json(['status' => 'Sukses!', 'message' => 'Semua memori cache Laravel cPanel telah dihancurkan total!']);
});

// ===== SEO: SITEMAP & RSS (JANGAN DIHAPUS) =====
/**
 * TAMBAHKAN route berikut di routes/web.php Laravel kamu.
 * (web.php, BUKAN api.php — supaya URL-nya https://sukamuda.co.id/sitemap.xml, tanpa prefix /api)
 *
 * PENTING untuk .htaccess:
 * Karena React SPA memakai fallback ke index.html, URL sitemap/feed harus
 * dikecualikan juga di .htaccess public_html. Tambahkan baris ini di bagian
 * pengecualian (bersama /api, /sanctum, /storage):
 *
 *   RewriteCond %{REQUEST_URI} ^/(api|sanctum|storage|sitemap|feed) [NC]
 *   ... RewriteRule ^ index.php [L]
 *
 * dan di blok SPA fallback:
 *
 *   RewriteCond %{REQUEST_URI} !^/(api|sanctum|storage|sitemap|feed) [NC]
 */

Route::get('/sitemap.xml', [SeoController::class, 'sitemap']);
Route::get('/sitemap-news.xml', [SeoController::class, 'newsSitemap']);
Route::get('/sitemap-images.xml', [SeoController::class, 'imageSitemap']);
Route::get('/sitemap-videos.xml', [SeoController::class, 'videoSitemap']);
Route::get('/feed', [SeoController::class, 'rss']);
