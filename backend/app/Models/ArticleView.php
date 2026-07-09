<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleView extends Model
{
    protected $fillable = ['article_id', 'user_id', 'ip_address'];
    public $timestamps = false;

    protected static function booted()
    {
        static::creating(function ($view) {
            $view->viewed_at = now();
        });
    }
}   