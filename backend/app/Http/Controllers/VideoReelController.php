<?php

namespace App\Http\Controllers;

use App\Models\VideoReel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage; // Tambahan wajib untuk menghapus gambar lama

class VideoReelController extends Controller
{
    /**
     * Get all active video reels (public)
     */
    public function getPublicReels(Request $request)
    {
        $reels = VideoReel::where('status', 'active')
            ->with('user')
            ->latest()
            ->paginate(20);

        return response()->json($reels);
    }

    /**
     * Get video reels by platform
     */
    public function getByPlatform(Request $request, $platform)
    {
        $allowed_platforms = ['instagram', 'tiktok', 'facebook', 'youtube'];
        
        if (!in_array(strtolower($platform), $allowed_platforms)) {
            return response()->json(['error' => 'Platform tidak valid'], 400);
        }

        $reels = VideoReel::where('status', 'active')
            ->where('platform', strtolower($platform))
            ->with('user')
            ->latest()
            ->paginate(20);

        return response()->json($reels);
    }

    /**
     * Get limited reels for homepage (8-12 random active reels)
     */
    public function getHomepageReels()
    {
        $reels = VideoReel::where('status', 'active')
            ->with('user')
            ->inRandomOrder()
            ->limit(12)
            ->get();

        return response()->json($reels);
    }

    /**
     * Get all reels (admin only)
     */
    public function index(Request $request)
    {
        // Jika kamu butuh cek admin, gunakan Gate seperti ini:
        // Gate::authorize('isAdmin');

        $query = VideoReel::with('user');

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
        }

        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('platform') && $request->platform != 'all') {
            $query->where('platform', $request->platform);
        }

        $reels = $query->latest()->paginate(15);
        return response()->json($reels);
    }

    /**
     * Get user's own video reels
     */
    public function getUserReels(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $reels = VideoReel::where('user_id', $user->id)
            ->latest()
            ->paginate(15);

        return response()->json($reels);
    }

    /**
     * Store video reel (admin/creator)
     */
    public function store(Request $request)
    {
        // 1. UBAH VALIDASI: thumbnail sekarang adalah file image, bukan string url
        $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string|max:500',
            'video_url'    => 'required|string|url',
            'platform'     => 'nullable|string|in:instagram,tiktok,facebook,youtube,auto',
            'thumbnail'    => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // <--- INI PENTING
        ]);

        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // 2. Ambil semua data request KECUALI file gambar
        $videoReel = new VideoReel($request->except('thumbnail'));
        
        // Auto-detect platform jika tidak ditentukan atau 'auto'
        if (empty($request->platform) || $request->platform === 'auto') {
            $videoReel->platform = $videoReel->detectPlatform($request->video_url);
        }

        // 3. PROSES UPLOAD GAMBAR BARU
        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            // Simpan gambar ke storage/app/public/reels
            $path = $file->store('reels', 'public');
            // Simpan URL lengkapnya ke database
            $videoReel->thumbnail_url = env('APP_URL') . '/storage/' . $path;
        }
        
        $videoReel->user_id = $user->id;
        $videoReel->status = Auth::guard('sanctum')->user()->role === 'admin' ? 'active' : 'draft';
        $videoReel->save();

        return response()->json($videoReel, 201);
    }

    /**
     * Update video reel (admin/creator)
     */
    public function update(Request $request, VideoReel $reel)
    {
        Gate::authorize('update', $reel);

        // 1. UBAH VALIDASI: thumbnail sekarang adalah file image
        $request->validate([
            'title'        => 'sometimes|string|max:255',
            'description'  => 'nullable|string|max:500',
            'video_url'    => 'sometimes|string|url',
            'platform'     => 'nullable|string|in:instagram,tiktok,facebook,youtube,auto',
            'status'       => 'sometimes|string|in:active,inactive,draft',
            'thumbnail'    => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // <--- INI PENTING
        ]);

        if ($request->has('video_url') && $request->video_url !== $reel->video_url) {
            if (empty($request->platform) || $request->platform === 'auto') {
                $reel->platform = $reel->detectPlatform($request->video_url);
            }
        }

        // 2. PROSES UPLOAD GAMBAR BARU SAAT EDIT
        if ($request->hasFile('thumbnail')) {
            // Hapus gambar lama jika ada (Biar harddisk nggak penuh)
            if ($reel->thumbnail_url) {
                // Ekstrak nama path-nya saja (misal: reels/namafile.jpg)
                $oldPath = str_replace(env('APP_URL') . '/storage/', '', $reel->thumbnail_url);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            // Simpan gambar baru
            $file = $request->file('thumbnail');
            $path = $file->store('reels', 'public');
            $reel->thumbnail_url = env('APP_URL') . '/storage/' . $path;
        }

        // Update data lainnya KECUALI file thumbnail
        $reel->update($request->except('thumbnail'));
        
        return response()->json($reel);
    }

    /**
     * Delete video reel (admin/creator)
     */
    public function destroy(VideoReel $reel)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        Gate::forUser($user)->authorize('delete', $reel); 

        // Hapus juga file fisiknya kalau mau bersih
        if ($reel->thumbnail_url) {
            $oldPath = str_replace(env('APP_URL') . '/storage/', '', $reel->thumbnail_url);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }
        
        $reel->delete();
        
        return response()->json(['message' => 'Video reel berhasil dihapus']);
    }

    /**
     * Get single reel
     */
    public function show(VideoReel $reel)
    {
        return response()->json($reel->load('user'));
    }

    /**
     * Approve reel (admin only)
     */
    public function approve(Request $request, VideoReel $reel)
    {
        Gate::authorize('isAdmin');
        
        $reel->update(['status' => 'active']);
        return response()->json(['message' => 'Video reel disetujui', 'reel' => $reel]);
    }

    /**
     * Reject reel (admin only)
     */
    public function reject(Request $request, VideoReel $reel)
    {
        Gate::authorize('isAdmin');
        
        $reel->update(['status' => 'inactive']);
        return response()->json(['message' => 'Video reel ditolak', 'reel' => $reel]);
    }
}