<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ArticleController; 
use App\Http\Controllers\AuthController; 
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\VideoReelController;
use App\Http\Middleware\CheckAdminRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - SUKAMUDA
|--------------------------------------------------------------------------
*/

// --- 1. PUBLIC ROUTES ---
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
    Route::post('/register', [RegisteredUserController::class, 'store']);
});

// Rate Limiting
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/resend-otp', [RegisteredUserController::class, 'resendOtp']);
    Route::post('/verify-otp', [RegisteredUserController::class, 'verifyOtp']);
    Route::post('/forgot-password/send-otp', [AuthController::class, 'sendResetOtp']);
    Route::post('/forgot-password/reset', [AuthController::class, 'resetPassword']);
});

// Konten Artikel Public
Route::get('/public-articles', [ArticleController::class, 'getPublicArticles']);
Route::get('/trending', [ArticleController::class, 'trending']); 
Route::get('/articles/{slug}', [ArticleController::class, 'showBySlug'])->where('slug', '^(?!trash$)[a-zA-Z0-9\-]+$');
Route::get('/articles/{id}/view', [ArticleController::class, 'incrementView']);
Route::get('/articles/{id}/comments', [ArticleController::class, 'getComments']);
Route::get('/users/{id}', [ProfileController::class, 'showPublic']);

// Video Reels Public
Route::get('/video-reels', [VideoReelController::class, 'getPublicReels']);
Route::get('/video-reels/homepage', [VideoReelController::class, 'getHomepageReels']);
Route::get('/video-reels/platform/{platform}', [VideoReelController::class, 'getByPlatform']);


// --- 2. PROTECTED ROUTES (WAJIB LOGIN SANCTUM) ---
Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/profile', [ProfileController::class, 'index']);
    Route::post('/profile', [ProfileController::class, 'update']);

    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

    Route::get('/articles', [ArticleController::class, 'index']);          
    Route::get('/articles/list/{category}', [ArticleController::class, 'listByCategory']);
    Route::post('/articles', [ArticleController::class, 'store']);          
    Route::put('/articles/{id}', [ArticleController::class, 'update']);      
    Route::delete('/articles/{id}', [ArticleController::class, 'destroy']); 

    Route::post('/articles/{id}/like', [ArticleController::class, 'toggleLike']);
    Route::post('/articles/{id}/bookmark', [ArticleController::class, 'toggleBookmark']);
    Route::post('/articles/{id}/comments', [ArticleController::class, 'storeComment']);
    Route::delete('/comments/{id}', [ArticleController::class, 'deleteComment']);
    Route::post('/reports', [ReportController::class, 'store']);

    Route::get('/my-video-reels', [VideoReelController::class, 'getUserReels']);
    Route::post('/video-reels', [VideoReelController::class, 'store']);
    Route::put('/video-reels/{reel}', [VideoReelController::class, 'update']);
    Route::delete('/video-reels/{reel}', [VideoReelController::class, 'destroy']);


    // --- 3. ADMIN AREA (WAJIB LOGIN ADMIN) ---
    Route::middleware(CheckAdminRole::class)->group(function () {
        Route::patch('/articles/{id}/status', [ArticleController::class, 'updateStatus']); 
        Route::patch('/articles/{id}/toggle-trending', [ArticleController::class, 'toggleTrending']);
        Route::get('/articles/trash', [ArticleController::class, 'trashIndex']);
        Route::patch('/articles/{id}/restore', [ArticleController::class, 'restore']);
        Route::delete('/articles/{id}/permanent', [ArticleController::class, 'forceDelete']);
        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/video-reels/admin/all', [VideoReelController::class, 'index']);
        Route::patch('/video-reels/{reel}/approve', [VideoReelController::class, 'approve']);
        Route::patch('/video-reels/{reel}/reject', [VideoReelController::class, 'reject']);
    });
});