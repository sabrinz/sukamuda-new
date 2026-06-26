<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ArticleController; 
use App\Http\Controllers\AuthController; 
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DebugController;
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

// --- 1. PUBLIC ROUTES (Tanpa Login) ---
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/register', [RegisteredUserController::class, 'store']);

// ===== DEBUG ROUTES (Untuk testing password) =====
Route::post('/debug/test-password', [DebugController::class, 'testPassword']);
Route::get('/debug/list-users', [DebugController::class, 'listUsers']);
// ===== END DEBUG =====

// Rate Limiting untuk OTP & Reset Password
Route::middleware('throttle:5,60')->group(function () {
    Route::post('/resend-otp', [RegisteredUserController::class, 'resendOtp']);
    Route::post('/verify-otp', [RegisteredUserController::class, 'verifyOtp']);
    Route::post('/forgot-password/send-otp', [AuthController::class, 'sendResetOtp']);
    Route::post('/forgot-password/reset', [AuthController::class, 'resetPassword']);
});

// Konten Publik (Artikel)
Route::get('/public-articles', [ArticleController::class, 'getPublicArticles']);
Route::get('/trending-articles', [ArticleController::class, 'trending']);
Route::get('/articles/{slug}', [ArticleController::class, 'showBySlug']);
Route::get('/articles/{id}/view', [ArticleController::class, 'incrementView']);
Route::get('/articles/{id}/comments', [ArticleController::class, 'getComments']);
Route::patch('/articles/{id}/toggle-trending', [ArticleController::class, 'toggleTrending']);
Route::get('/users/{id}', [ProfileController::class, 'showPublic']);

// Konten Publik (Video Reels)
Route::get('/video-reels', [VideoReelController::class, 'getPublicReels']);
Route::get('/video-reels/homepage', [VideoReelController::class, 'getHomepageReels']);
Route::get('/video-reels/platform/{platform}', [VideoReelController::class, 'getByPlatform']);


// --- 2. PROTECTED ROUTES (Wajib Login/Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // --- AUTH & USER INFO ---
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    // --- PROFILE PAGE ROUTES ---
    // Dipakai oleh Profile.jsx untuk mengambil data User + Artikel (Posts, Review, Draft, Favorite)
    Route::get('/profile', [ProfileController::class, 'index']);
    Route::post('/profile', [ProfileController::class, 'update']);

    // --- MANAJEMEN PROFIL (SETTINGS) ---
    Route::prefix('user')->group(function () {
        Route::get('/profile', [ProfileController::class, 'getProfile']); 
        Route::post('/profile', [ProfileController::class, 'updateProfile']);
        Route::put('/password', [ProfileController::class, 'changePassword']);
        Route::delete('/account', [ProfileController::class, 'deleteAccount']);
    });

    // --- SISTEM ARTIKEL (NOTIFIKASI) ---
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

    // --- SISTEM ARTIKEL (CRUD & INTERAKSI) ---
    Route::get('/articles', [ArticleController::class, 'index']);          
    Route::get('/articles/list/{category}', [ArticleController::class, 'listByCategory']);
    Route::post('/articles', [ArticleController::class, 'store']);          // Simpan artikel baru
    
    // PERBAIKAN: Menggunakan PUT/PATCH untuk update. Jangan gunakan POST dengan URL yang sama dengan create.
    Route::put('/articles/{id}', [ArticleController::class, 'update']);      // Update artikel (Standar REST)
    
    Route::delete('/articles/{id}', [ArticleController::class, 'destroy']); 

    // Interaksi User terhadap Artikel
    Route::post('/articles/{id}/like', [ArticleController::class, 'toggleLike']);
    Route::post('/articles/{id}/bookmark', [ArticleController::class, 'toggleBookmark']);
    Route::post('/articles/{id}/comments', [ArticleController::class, 'storeComment']);
    Route::delete('/comments/{id}', [ArticleController::class, 'deleteComment']);

    // Reports
    Route::post('/reports', [ReportController::class, 'store']);

    // --- VIDEO REELS MANAGEMENT ---
    Route::get('/my-video-reels', [VideoReelController::class, 'getUserReels']);
    Route::post('/video-reels', [VideoReelController::class, 'store']);
    Route::put('/video-reels/{reel}', [VideoReelController::class, 'update']);
    Route::delete('/video-reels/{reel}', [VideoReelController::class, 'destroy']);

    // --- 3. AREA ADMIN ---
    Route::middleware(CheckAdminRole::class)->group(function () {
        // Update status approved/rejected/pending
        Route::patch('/articles/{id}/status', [ArticleController::class, 'updateStatus']); 
        Route::get('/articles/trash', [ArticleController::class, 'trashIndex']);
        Route::patch('/articles/{id}/restore', [ArticleController::class, 'restore']);
        Route::delete('/articles/{id}/permanent', [ArticleController::class, 'forceDelete']);
        // Reports for admin
        Route::get('/reports', [ReportController::class, 'index']);

        // --- VIDEO REELS ADMIN MANAGEMENT ---
        Route::get('/video-reels/admin/all', [VideoReelController::class, 'index']);
        Route::patch('/video-reels/{reel}/approve', [VideoReelController::class, 'approve']);
        Route::patch('/video-reels/{reel}/reject', [VideoReelController::class, 'reject']);
    });
});

// === ROUTE UNTUK VIDEO REELS ===
Route::prefix('video-reels')->group(function () {
    // Tampilan Publik
    Route::get('/homepage', [\App\Http\Controllers\VideoReelController::class, 'getHomepageReels']);
    
    // Tampilan Admin (Sesuai dengan axios di React)
    Route::get('/admin/all', [\App\Http\Controllers\VideoReelController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\VideoReelController::class, 'store']);
    Route::patch('/{reel}/approve', [\App\Http\Controllers\VideoReelController::class, 'approve']);
    Route::patch('/{reel}/reject', [\App\Http\Controllers\VideoReelController::class, 'reject']);
    Route::delete('/{reel}', [\App\Http\Controllers\VideoReelController::class, 'destroy']);
});