<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;

// 1. Tambahkan dua baris ini di bagian atas
use Illuminate\Support\Facades\Gate;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Pastikan skema URL menggunakan http di lokal agar tidak bentrok dengan SSL
        if (app()->isLocal()) {
            URL::forceScheme('http');
        }

        // Konfigurasi Reset Password agar mengarah ke URL Frontend React
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });

        // Pengaturan Keamanan Sanctum (Opsional tapi bagus untuk kestabilan Cookie)
        Sanctum::usePersonalAccessTokenModel(\Laravel\Sanctum\PersonalAccessToken::class);

        // 2. Tambahkan Gate isAdmin di sini (di dalam fungsi boot)
        Gate::define('isAdmin', function (User $user) {
            // Pastikan 'role' adalah nama kolom yang sesuai dengan di tabel users kamu
            return $user->role === 'admin'; 
        });
    }
}