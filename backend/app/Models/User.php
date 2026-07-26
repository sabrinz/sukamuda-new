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

    /**
     * The attributes that are mass assignable.
     * * Semua kolom profil Sukamuda sudah masuk ke sini agar bisa disimpan lewat ProfileController.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        // 'role' sengaja TIDAK fillable demi keamanan.
        // Set role admin langsung lewat phpMyAdmin/database.
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

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     * * Sangat penting: 'interests' => 'array' memastikan data JSON di database 
     * dikonversi menjadi array murni saat sampai di React (mencegah error .map())
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'birth_date' => 'date',
            'interests' => 'array', 
        ];
    }

    /**
     * Relasi ke Artikel yang ditulis oleh user ini.
     */
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
    
    public function getAvatarAttribute($value)
{
    if ($value) {
        return url('storage/' . $value);
    }
    return null; // atau kembalikan link gambar default
}
}