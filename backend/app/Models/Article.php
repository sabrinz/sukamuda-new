<?php

namespace App\Models;

// SAYA TAMBAHKAN SEMUA IMPORT INI SUPAYA TIDAK ERROR
use App\Models\User;
use App\Models\Comment;
use App\Models\ArticleLike;
use App\Models\Notification;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
        'status', // Nilai: 'approved', 'pending', 'draft', 'rejected'
        'rejection_reason',
        'views',
        'is_trending', // Tambahkan
        'audio_link',  // Untuk podcast Spotify link
        'video_link',  // Untuk podcast YouTube link
    ];

    /**
     * Relasi: Artikel ini milik User siapa?
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi: Artikel ini punya komentar apa saja?
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Relasi ke tabel likes untuk menghitung jumlah suka
     */
    public function likes(): HasMany
    {
        return $this->hasMany(ArticleLike::class);
    }

    /**
     * Relasi balik untuk mengetahui siapa saja yang menyukai artikel ini
     * (Ini dipakai untuk Tab "Disukai" di Profil User)
     */
    public function likedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'article_likes', 'article_id', 'user_id')
                    ->withTimestamps();
    }

    /**
     * Relasi ke notifikasi yang terkait dengan artikel ini
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}