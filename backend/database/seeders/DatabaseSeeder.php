<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Article;

class ResetViewsSeeder extends Seeder
{
    public function run()
    {
        // 1. Cari 5 artikel dengan view tertinggi MINGGU INI
        // Yang TIDAK PERNAH trending, dan BUKAN hasil settingan manual admin
        $topArticles = Article::withCount('views')
            ->where('status', 'approved')
            ->where('is_ever_trending', false)
            ->where('is_manual_trending', false)
            ->orderByDesc('views_count')
            ->take(5)
            ->get();

        // 2. Tandai artikel tersebut "SUDAH PERNAH TRENDING"
        foreach ($topArticles as $article) {
            $article->update(['is_ever_trending' => true]);
        }

        // 3. Reset papan skor mingguan (Kosongkan tabel article_views)
        DB::table('article_views')->truncate();
    }
}