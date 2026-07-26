<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Helper internal untuk memaksa URL gambar menjadi absolut HTTPS menunjuk domain utama
     */
    private function formatAssetUrl($path)
    {
        if (empty($path) || !is_string($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return str_replace('http://127.0.0.1:8000', 'https://sukamuda.co.id', $path);
        }

        return 'https://sukamuda.co.id/storage/' . ltrim($path, '/');
    }

    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['message' => 'User tidak ditemukan'], 401);
            }

            $allArticles = Article::where('user_id', $user->id)->get();

            $posts = $allArticles->where('status', 'approved')->values();
            $drafts = $allArticles->where('status', 'draft')->values();
            $pending = $allArticles->where('status', 'pending')->values();

            // PENGAMNAN: Jika relasi favorites() belum diset di model User, 
            // fallback agar tidak melempar Fatal Error Query Exception
            $favorites = method_exists($user, 'favorites') ? $user->favorites()->get() : collect();

            $data = [
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio ?? '',
                'profession' => $user->profession ?? '',
                'schoolName' => $user->school_name ?? '',
                'interests' => is_array($user->interests) ? $user->interests : [],
                'avatar' => $this->formatAssetUrl($user->avatar),
                'coverPhoto' => $this->formatAssetUrl($user->cover_photo),
                
                'posts' => $this->formatArticles($posts),
                'drafts' => $this->formatArticles($drafts),
                'pending' => $this->formatArticles($pending),
                'favorites' => $this->formatArticles($favorites),
            ];

            return response()->json([
                'message' => 'Success',
                'data' => $data
            ]);

        } catch (\Exception $e) {
            Log::error("Profile Index Error: " . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan pada server',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'bio' => 'nullable|string|max:500',
                'profession' => 'nullable|string|max:100',
                'schoolName' => 'nullable|string|max:100',
                'interests' => 'nullable|array',
                'avatarFile' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
                'coverPhotoFile' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            ]);

            $user = $request->user();

            $user->name = $request->name;
            $user->bio = $request->bio;
            $user->profession = $request->profession;
            $user->school_name = $request->schoolName;
            
            if ($request->has('interests')) {
                 $user->interests = $request->interests;
            }
            
            if ($request->hasFile('avatarFile')) {
                if ($user->avatar) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $path = $request->file('avatarFile')->store('avatars', 'public');
                $user->avatar = $path;
            }

            if ($request->hasFile('coverPhotoFile')) {
                if ($user->cover_photo) {
                    Storage::disk('public')->delete($user->cover_photo);
                }
                $path = $request->file('coverPhotoFile')->store('cover_photos', 'public');
                $user->cover_photo = $path;
            }

            $user->save();

            return $this->index($request);

        } catch (\Exception $e) {
            Log::error("Profile Update Error: " . $e->getMessage());
            return response()->json(['message' => 'Gagal update profil', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * PERBAIKAN: Mengintegrasikan fungsi Mengubah Password Akun secara Aman
     */
    public function changePassword(Request $request)
    {
        try {
            $request->validate([
                'current_password' => 'required|string',
                'password' => ['required', 'confirmed', Password::defaults()],
            ]);

            $user = $request->user();

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Kata sandi saat ini tidak cocok dengan data kami.'
                ], 422);
            }

            $user->password = Hash::make($request->password);
            $user->save();

            return response()->json([
                'message' => 'Kata sandi berhasil diperbarui dengan aman.'
            ]);

        } catch (\Exception $e) {
            Log::error("Profile Change Password Error: " . $e->getMessage());
            return response()->json(['message' => 'Gagal mengubah kata sandi', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * PERBAIKAN: Mengintegrasikan fungsi Hapus Akun secara Permanen
     */
    public function deleteAccount(Request $request)
    {
        try {
            $request->validate([
                'password' => 'required|string',
            ]);

            $user = $request->user();

            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Konfirmasi kata sandi gagal. Akun tidak dapat dihapus.'
                ], 422);
            }

            // Bersihkan aset gambar fisik milik user agar tidak membebani kapasitas hosting
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            if ($user->cover_photo) {
                Storage::disk('public')->delete($user->cover_photo);
            }

            // Hapus token akses sesi login aktif sebelum menghancurkan data user
            $user->tokens()->delete();
            $user->delete();

            return response()->json([
                'message' => 'Akun Anda berhasil dihapus secara permanen dari sistem kami.'
            ]);

        } catch (\Exception $e) {
            Log::error("Profile Delete Account Error: " . $e->getMessage());
            return response()->json(['message' => 'Gagal menghapus akun', 'error' => $e->getMessage()], 500);
        }
    }

    private function formatArticles($articles)
    {
        if (!$articles || $articles->isEmpty()) {
            return [];
        }

        $formatted = [];
        foreach ($articles as $article) {
            if (!$article) continue;

            try {
                $formatted[] = [
                    'id' => $article->id,
                    'title' => $article->title ?? 'Tanpa Judul',
                    'slug' => $article->slug ?? '',
                    'category' => $article->category ?? 'Umum',
                    'image' => $this->formatAssetUrl($article->image),
                    'excerpt' => $article->summary ?? '',
                    'content' => $article->content ?? '',
                    'status' => $article->status,
                    'createdAt' => $article->created_at,
                    'updatedAt' => $article->updated_at,
                ];
            } catch (\Exception $e) {
                continue;
            }
        }

        return array_values($formatted);
    }

    public function showPublic($id)
    {
        try {
            $user = User::findOrFail($id);

            $articles = Article::where('user_id', $user->id)
                ->where('status', 'approved')
                ->latest()
                ->get();

            return response()->json([
                'message' => 'Success',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'bio' => $user->bio ?? '',
                    'profession' => $user->profession ?? '',
                    'schoolName' => $user->school_name ?? '',
                    'avatar' => $this->formatAssetUrl($user->avatar),
                    'coverPhoto' => $this->formatAssetUrl($user->cover_photo),
                    'articles' => $this->formatArticles($articles),
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan server', 'error' => $e->getMessage()], 500);
        }
    }
}