<?php

use App\Models\Article;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('articles')) {
            return;
        }

        Article::query()->orderBy('id')->chunkById(100, function ($articles) {
            foreach ($articles as $article) {
                $article->slug = Article::generateUniqueSlug($article->title, $article->id);
                $article->saveQuietly();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Data correction only.
    }
};