<?php

namespace App\Models;

use App\Models\User;
use App\Models\Comment;
use App\Models\ArticleLike;
use App\Models\ArticleView; // <- DITAMBAHKAN
use App\Models\Notification;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Article extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'category',
        'image',
        'image_caption',
        'summary',
        'content',
        'tags',
        'status',
        'rejection_reason',
        'views',
        // 'is_trending', -> DIHAPUS (Diganti 2 kolom baru di bawah)
        'is_ever_trending',  // <- DITAMBAHKAN
        'is_manual_trending', // <- DITAMBAHKAN
        'audio_link',
        'video_link',
    ];

    protected static function booted(): void
    {
        static::saving(function (Article $article) {
            if (!$article->slug || $article->isDirty('title')) {
                $article->slug = static::generateUniqueSlug(
                    $article->title,
                    $article->exists ? $article->id : null
                );
            }
        });
    }

    public static function generateUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($title) ?: 'artikel';
        $slug = $baseSlug;
        $counter = 2;

        while (
            static::withTrashed()
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(ArticleLike::class);
    }

    public function likedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'article_likes', 'article_id', 'user_id')
                    ->withTimestamps();
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // ==========================================
    // FUNGSI TRENDING & VIEW BARU (DITAMBAHKAN)
    // ==========================================

    public function views()
    {
        return $this->hasMany(ArticleView::class);
    }

    public function getUniqueViewsCountAttribute()
    {
        return $this->views()->distinct('user_id')->count() + $this->views()->whereNull('user_id')->distinct('ip_address')->count();
    }
}