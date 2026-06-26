<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoReel extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'video_url',
        'platform', // instagram, tiktok, facebook, youtube
        'thumbnail_url',
        'status', // active, inactive, draft
        'views',
    ];

    /**
     * Relasi: Video Reel ini milik User siapa?
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: Ambil video yang status-nya active
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: Filter by platform
     */
    public function scopeByPlatform($query, $platform)
    {
        return $query->where('platform', $platform);
    }

    /**
     * Accessor: Deteksi platform dari URL jika belum tersimpan
     */
    public function detectPlatform($url)
    {
        $url_lower = strtolower($url);
        
        if (str_contains($url_lower, 'instagram.com') || str_contains($url_lower, 'ig.me')) return 'instagram';
        if (str_contains($url_lower, 'tiktok.com') || str_contains($url_lower, 'vm.tiktok.com')) return 'tiktok';
        if (str_contains($url_lower, 'facebook.com') || str_contains($url_lower, 'fb.watch')) return 'facebook';
        if (str_contains($url_lower, 'youtube.com') || str_contains($url_lower, 'youtu.be')) return 'youtube';
        
        return 'unknown'; 
    }

    /**
     * Mutator: Otomatis deteksi platform saat disimpan
     */
    public function setPlatformAttribute($value)
    {
        if ($value === 'auto' || empty($value)) {
            $this->attributes['platform'] = $this->detectPlatform($this->attributes['video_url'] ?? '');
        } else {
            $this->attributes['platform'] = $value;
        }
    }
}