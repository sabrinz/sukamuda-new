<?php

use Illuminate\Support\Facades\Route;
use App\Models\Article;
use Illuminate\Support\Str;

Route::get('/', function () {
    return ['status' => 'SukaMuda API is Online'];
});

Route::get('/article/{slug}', function (string $slug) {
    $frontendUrl = rtrim(env('FRONTEND_URL', 'http://127.0.0.1:5174'), '/');

    $article = Article::with('user')
        ->where('slug', $slug)
        ->where('status', 'approved')
        ->first();

    $shareTitle = $article?->title ?: 'SukaMuda';
    $shareDescription = $article?->summary
        ?: Str::limit(strip_tags($article?->content ?? ''), 160)
        ?: 'Baca artikel terbaru di SukaMuda.';

    $imageUrl = asset('logo.png');
    if ($article?->image) {
        $imageUrl = filter_var($article->image, FILTER_VALIDATE_URL)
            ? $article->image
            : asset('storage/' . $article->image);
    }

    if ($imageUrl === asset('logo.png') && $article?->video_link) {
        $videoId = null;
        $videoUrl = trim($article->video_link);

        try {
            $parsed = parse_url($videoUrl);
            if (!is_array($parsed)) {
                $parsed = [];
            }

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
        } catch (\Throwable $e) {
            $videoId = null;
        }

        if ($videoId) {
            $imageUrl = 'https://img.youtube.com/vi/' . $videoId . '/hqdefault.jpg';
        }
    }

    $articleUrl = $frontendUrl . '/article/' . $slug;

    return response()->view('article-share', [
        'shareTitle' => $shareTitle,
        'shareDescription' => $shareDescription,
        'shareImage' => $imageUrl,
        'shareUrl' => url('/article/' . $slug),
        'articleUrl' => $articleUrl,
    ]);
});

// Tambahkan ini agar named route 'login' tidak error
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');