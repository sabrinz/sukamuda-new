<?php

namespace App\Http\Controllers;

use App\Models\Article; // SESUAIKAN dengan nama model artikel kamu
use Illuminate\Support\Facades\Cache;

/**
 * SeoController - sitemap.xml, news sitemap, image sitemap, video sitemap, RSS feed
 *
 * CATATAN PENYESUAIAN:
 * - Ganti App\Models\Article jika nama model berbeda.
 * - Sesuaikan scope status artikel publish: di sini diasumsikan kolom `status` = 'approved'.
 *   Kalau kamu pakai 'published' / kolom lain, ganti di method publishedArticles().
 * - Kolom yang dipakai: slug, title, summary, image, video_link, category, created_at, updated_at,
 *   dan relasi user (name). Sesuaikan bila berbeda.
 */
class SeoController extends Controller
{
    private const BASE_URL = 'https://sukamuda.co.id';
    private const CACHE_MINUTES = 30;

    private function publishedArticles()
    {
        return Article::with('user')
            ->where('status', 'approved') // <-- SESUAIKAN
            ->orderByDesc('created_at');
    }

    private function articleUrl($article): string
    {
        return self::BASE_URL . '/article/' . $article->slug;
    }

    private function imageUrl($article): ?string
    {
        if (!$article->image) return null;
        return str_starts_with($article->image, 'http')
            ? $article->image
            : self::BASE_URL . '/storage/' . $article->image;
    }

    private function xml(string $body)
    {
        return response($body, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    private function esc(?string $v): string
    {
        return htmlspecialchars($v ?? '', ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    /** /sitemap.xml - halaman statis + semua artikel */
    public function sitemap()
    {
        $xml = Cache::remember('seo.sitemap', now()->addMinutes(self::CACHE_MINUTES), function () {
            $staticPages = ['', '/about', '/privacy', '/rules', '/terms', '/help', '/faq', '/video-reels'];
            $out = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $out .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

            foreach ($staticPages as $page) {
                $out .= "  <url><loc>" . self::BASE_URL . $this->esc($page) . "</loc><changefreq>weekly</changefreq></url>\n";
            }

            foreach ($this->publishedArticles()->get() as $article) {
                $lastmod = optional($article->updated_at ?? $article->created_at)->toAtomString();
                $out .= '  <url>';
                $out .= '<loc>' . $this->esc($this->articleUrl($article)) . '</loc>';
                $out .= '<lastmod>' . $lastmod . '</lastmod>';
                $out .= '<changefreq>daily</changefreq>';
                $out .= "</url>\n";
            }

            return $out . '</urlset>';
        });

        return $this->xml($xml);
    }

    /** /sitemap-news.xml - Google News: hanya artikel 48 jam terakhir */
    public function newsSitemap()
    {
        $xml = Cache::remember('seo.sitemap.news', now()->addMinutes(10), function () {
            $articles = $this->publishedArticles()
                ->where('created_at', '>=', now()->subHours(48))
                ->get();

            $out = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $out .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">' . "\n";

            foreach ($articles as $article) {
                $out .= "  <url>\n";
                $out .= '    <loc>' . $this->esc($this->articleUrl($article)) . "</loc>\n";
                $out .= "    <news:news>\n";
                $out .= "      <news:publication>\n";
                $out .= "        <news:name>SukaMuda</news:name>\n";
                $out .= "        <news:language>id</news:language>\n";
                $out .= "      </news:publication>\n";
                $out .= '      <news:publication_date>' . $article->created_at->toAtomString() . "</news:publication_date>\n";
                $out .= '      <news:title>' . $this->esc($article->title) . "</news:title>\n";
                $out .= "    </news:news>\n";
                $out .= "  </url>\n";
            }

            return $out . '</urlset>';
        });

        return $this->xml($xml);
    }

    /** /sitemap-images.xml - artikel yang punya gambar */
    public function imageSitemap()
    {
        $xml = Cache::remember('seo.sitemap.images', now()->addMinutes(self::CACHE_MINUTES), function () {
            $articles = $this->publishedArticles()->whereNotNull('image')->get();

            $out = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $out .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

            foreach ($articles as $article) {
                $img = $this->imageUrl($article);
                if (!$img) continue;
                $out .= "  <url>\n";
                $out .= '    <loc>' . $this->esc($this->articleUrl($article)) . "</loc>\n";
                $out .= "    <image:image>\n";
                $out .= '      <image:loc>' . $this->esc($img) . "</image:loc>\n";
                $out .= "    </image:image>\n";
                $out .= "  </url>\n";
            }

            return $out . '</urlset>';
        });

        return $this->xml($xml);
    }

    /** /sitemap-videos.xml - artikel podcast/video yang punya video_link */
    public function videoSitemap()
    {
        $xml = Cache::remember('seo.sitemap.videos', now()->addMinutes(self::CACHE_MINUTES), function () {
            $articles = $this->publishedArticles()->whereNotNull('video_link')->get();

            $out = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $out .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">' . "\n";

            foreach ($articles as $article) {
                $thumb = $this->imageUrl($article) ?? self::BASE_URL . '/logo.png';
                $out .= "  <url>\n";
                $out .= '    <loc>' . $this->esc($this->articleUrl($article)) . "</loc>\n";
                $out .= "    <video:video>\n";
                $out .= '      <video:thumbnail_loc>' . $this->esc($thumb) . "</video:thumbnail_loc>\n";
                $out .= '      <video:title>' . $this->esc($article->title) . "</video:title>\n";
                $out .= '      <video:description>' . $this->esc($article->summary ?? $article->title) . "</video:description>\n";
                $out .= '      <video:player_loc>' . $this->esc($article->video_link) . "</video:player_loc>\n";
                $out .= '      <video:publication_date>' . $article->created_at->toAtomString() . "</video:publication_date>\n";
                $out .= "    </video:video>\n";
                $out .= "  </url>\n";
            }

            return $out . '</urlset>';
        });

        return $this->xml($xml);
    }

    /** /feed - RSS 2.0, 30 artikel terbaru */
    public function rss()
    {
        $xml = Cache::remember('seo.rss', now()->addMinutes(10), function () {
            $articles = $this->publishedArticles()->limit(30)->get();

            $out = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $out .= '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">' . "\n";
            $out .= "<channel>\n";
            $out .= '  <title>SukaMuda - Portal Berita &amp; Informasi Anak Muda</title>' . "\n";
            $out .= '  <link>' . self::BASE_URL . "</link>\n";
            $out .= '  <description>Portal berita dan informasi terpercaya untuk anak muda</description>' . "\n";
            $out .= '  <language>id-ID</language>' . "\n";
            $out .= '  <atom:link href="' . self::BASE_URL . '/feed" rel="self" type="application/rss+xml" />' . "\n";

            foreach ($articles as $article) {
                $out .= "  <item>\n";
                $out .= '    <title>' . $this->esc($article->title) . "</title>\n";
                $out .= '    <link>' . $this->esc($this->articleUrl($article)) . "</link>\n";
                $out .= '    <guid isPermaLink="true">' . $this->esc($this->articleUrl($article)) . "</guid>\n";
                $out .= '    <description>' . $this->esc($article->summary ?? '') . "</description>\n";
                $out .= '    <pubDate>' . $article->created_at->toRssString() . "</pubDate>\n";
                if ($article->user) {
                    $out .= '    <author>' . $this->esc($article->user->name) . "</author>\n";
                }
                $out .= "  </item>\n";
            }

            return $out . "</channel>\n</rss>";
        });

        return response($xml, 200)->header('Content-Type', 'application/rss+xml; charset=UTF-8');
    }
}
