<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
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

            $favorites = $user->favorites()->get();

            $data = [
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio ?? '',
                'profession' => $user->profession ?? '',
                'schoolName' => $user->school_name ?? '',
                'interests' => is_array($user->interests) ? $user->interests : [],
                'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
                'coverPhoto' => $user->cover_photo ? asset('storage/' . $user->cover_photo) : null,
                
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
                    'image' => !empty($article->image) 
                        ? (filter_var($article->image, FILTER_VALIDATE_URL) ? $article->image : asset('storage/' . $article->image)) 
                        : null,
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
                    'avatar' => $user->avatar ? (filter_var($user->avatar, FILTER_VALIDATE_URL) ? $user->avatar : asset('storage/' . $user->avatar)) : null,
                    'coverPhoto' => $user->cover_photo ? (filter_var($user->cover_photo, FILTER_VALIDATE_URL) ? $user->cover_photo : asset('storage/' . $user->cover_photo)) : null,
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