<?php

use Illuminate\Support\Facades\Route;
use App\Models\Article;
use Illuminate\Support\Str;

Route::get('/', function () {
    return response()->json(['status' => 'SukaMuda Web Server is Online']);
});


Route::get('/article/{slug}', function (string $slug) {
    
    $userAgent = request()->userAgent() ?? '';
    $isBot = str_contains($userAgent, 'facebookexternalhit') || 
             str_contains($userAgent, 'Facebook') || 
             str_contains($userAgent, 'WhatsApp') || 
             str_contains($userAgent, 'Twitterbot') || 
             str_contains($userAgent, 'TelegramBot') || 
             str_contains($userAgent, 'LinkedInBot');

    if (!$isBot) {
        if (file_exists(public_path('index.html'))) {
            return response()->file(public_path('index.html'));
        }
        return redirect(env('FRONTEND_URL', 'https://sukamuda.co.id') . '/article/' . $slug);
    }

    $frontendUrl = rtrim(env('FRONTEND_URL', 'https://sukamuda.co.id'), '/');

    $article = Article::with('user')
        ->where('slug', $slug)
        ->where('status', 'approved')
        ->first();

    if (!$article) {
        return response()->view('article_share', [
            'shareTitle'       => 'SukaMuda - Portal Berita Anak Muda',
            'shareDescription' => 'Baca artikel dan berita literasi anak muda menarik lainnya di SukaMuda.',
            'shareImage'       => secure_asset('logo.png'),
            'shareUrl'         => $frontendUrl . '/article/' . $slug,
            'articleUrl'       => $frontendUrl,
        ]);
    }
    $shareTitle = $article->title . ' - SUKAMUDA';
    $shareDescription = $article->summary 
        ? Str::limit(strip_tags($article->summary), 140, '...')
        : Str::limit(strip_tags($article->content ?? ''), 140, '...');

    $imageUrl = secure_asset('logo.png');
    if ($article->image) {
        $imageUrl = filter_var($article->image, FILTER_VALIDATE_URL)
            ? Str::replaceFirst('http://', 'https://', $article->image)
            : secure_asset('storage/' . $article->image);
    }

    // 7. Fallback ambil Thumbnail YouTube jika Podcast Video tapi tidak punya cover
    if (($imageUrl === secure_asset('logo.png')) && $article->video_link) {
        $videoId = null;
        $videoUrl = trim($article->video_link);

        try {
            $parsed = parse_url($videoUrl);
            if (is_array($parsed)) {
                $host = strtolower($parsed['host'] ?? '');
                $path = $parsed['path'] ?? '';
                $query = [];

                if (isset($parsed['query'])) {
                    parse_str($parsed['query'], $query);
                }

                if (str_contains($host, 'youtu.be')) {
                    $videoId = ltrim($path, '/');
                } elseif (str_contains($host, 'youtube.com') || str_contains($host, 'youtube-nocookie.com')) {
                    if (str_starts_with($path, '/watch')) {
                        $videoId = $query['v'] ?? null;
                    } elseif (str_starts_with($path, '/embed/')) {
                        $videoId = basename($path);
                    } elseif (str_starts_with($path, '/shorts/')) {
                        $videoId = basename($path);
                    }
                }
            }
        } catch (\Throwable $e) {
            $videoId = null;
        }

        if ($videoId) {
            $imageUrl = 'https://img.youtube.com/vi/' . $videoId . '/hqdefault.jpg';
        }
    }

    // 8. URL artikel yang akan mengarahkan user ke React
    $articleUrl = $frontendUrl . '/article/' . $slug;

    // 9. Kirim ke view Blade
    return response()->view('article_share', [
        'shareTitle'       => $shareTitle,
        'shareDescription' => $shareDescription,
        'shareImage'       => $imageUrl,
        'shareUrl'         => $articleUrl,
        'articleUrl'       => $articleUrl,
    ]);
})->where('slug', '[a-zA-Z0-9\-]+'); // Regex agar tidak bentrok dengan route lain

// Jalur bypass login bawaan laravel sanctum
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');