<?php

namespace App\Http\Controllers;

use App\Models\VideoReel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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
     * Get limited reels for homepage
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
     * Get all reels (admin)
     */
    public function index(Request $request)
    {
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
     * Store video reel
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string|max:500',
            'video_url'    => 'required|string|url',
            'platform'     => 'nullable|string|in:instagram,tiktok,facebook,youtube,auto',
            'thumbnail'    => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $videoReel = new VideoReel($request->except('thumbnail'));
        
        if (empty($request->platform) || $request->platform === 'auto') {
            $videoReel->platform = $videoReel->detectPlatform($request->video_url);
        }

        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $path = $file->store('reels', 'public');
            $videoReel->thumbnail_url = config('app.url') . '/storage/' . $path;
        }
        
        $videoReel->user_id = $user->id;
        $videoReel->status = $user->role === 'admin' ? 'active' : 'draft';
        $videoReel->save();

        return response()->json($videoReel, 201);
    }

    /**
     * Update video reel
     */
    public function update(Request $request, $id) // <-- Diubah menggunakan $id
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $reel = VideoReel::findOrFail($id); // <-- Pencarian manual

        if ($user->role !== 'admin' && $user->id !== $reel->user_id) {
            return response()->json(['error' => 'Forbidden. Kamu tidak punya izin mengedit video ini.'], 403);
        }

        $request->validate([
            'title'        => 'sometimes|string|max:255',
            'description'  => 'nullable|string|max:500',
            'video_url'    => 'sometimes|string|url',
            'platform'     => 'nullable|string|in:instagram,tiktok,facebook,youtube,auto',
            'status'       => 'sometimes|string|in:active,inactive,draft',
            'thumbnail'    => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->has('video_url') && $request->video_url !== $reel->video_url) {
            if (empty($request->platform) || $request->platform === 'auto') {
                $reel->platform = $reel->detectPlatform($request->video_url);
            }
        }

        if ($request->hasFile('thumbnail')) {
            if ($reel->thumbnail_url) {
                $oldPath = str_replace(config('app.url') . '/storage/', '', $reel->thumbnail_url);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $file = $request->file('thumbnail');
            $path = $file->store('reels', 'public');
            $reel->thumbnail_url = config('app.url') . '/storage/' . $path;
        }

        $data = $request->except('thumbnail');
        // KEAMANAN: views & user_id tidak boleh diubah lewat request
        unset($data['views'], $data['user_id']);
        // KEAMANAN: hanya admin yang boleh mengubah status reel (anti bypass moderasi)
        if ($user->role !== 'admin') {
            unset($data['status']);
        }
        $reel->update($data);
        
        return response()->json($reel);
    }

    /**
     * Delete video reel (permanen)
     */
    public function destroy($id) // <-- Diubah menggunakan $id
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $reel = VideoReel::findOrFail($id); // <-- Pencarian manual

        if ($user->role !== 'admin' && $user->id !== $reel->user_id) {
            return response()->json(['error' => 'Forbidden. Kamu tidak punya izin menghapus video ini.'], 403);
        }

        if ($reel->thumbnail_url) {
            $oldPath = str_replace(config('app.url') . '/storage/', '', $reel->thumbnail_url);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }
        
        $reel->delete();
        
        return response()->json(['message' => 'Video reel berhasil dihapus']);
    }

    /**
     * Approve reel (admin) - dipanggil PATCH /video-reels/{reel}/approve
     */
    public function approve($id)
    {
        $reel = VideoReel::findOrFail($id);
        $reel->status = 'active';
        $reel->save();

        return response()->json(['message' => 'Video reel disetujui', 'data' => $reel->load('user')]);
    }

    /**
     * Reject reel (admin) - dipanggil PATCH /video-reels/{reel}/reject
     */
    public function reject($id)
    {
        $reel = VideoReel::findOrFail($id);
        $reel->status = 'inactive';
        $reel->save();

        return response()->json(['message' => 'Video reel ditolak', 'data' => $reel->load('user')]);
    }

    /**
     * Get single reel
     */
    public function show($id) // <-- Diubah menggunakan $id
    {
        $reel = VideoReel::findOrFail($id); // <-- Pencarian manual
        
        return response()->json($reel->load('user'));
    }
}