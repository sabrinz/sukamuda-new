<?php

namespace App\Models;

use App\Models\Article;
use App\Models\Comment; 

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

   
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'cover_photo',
        'bio',
        'phone',
        'birth_date',
        'gender',
        'instagram_url',
        'linkedin_url',
        'profession',
        'school_name', 
        'interests', 
    ];

    
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'birth_date' => 'date',
            'interests' => 'array', 
        ];
    }

   
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class)->latest();
    }

    /**
     * Relasi ke komentar yang dibuat oleh user ini.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class); // Sekarang ini aman karena sudah import
    }

    /**
     * Relasi untuk fitur Like (Tab "Disukai" di Profil).
     * Menghubungkan User ke Article melalui tabel perantara 'article_likes'.
     */
    public function favorites(): BelongsToMany
    {
        return $this->belongsToMany(Article::class, 'article_likes', 'user_id', 'article_id')
                    ->withTimestamps();
    }

    /**
     * Helper untuk mengecek apakah user adalah admin.
     * Bisa digunakan di controller: if ($user->isAdmin()) { ... }
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}