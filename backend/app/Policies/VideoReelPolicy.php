<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VideoReel;

class VideoReelPolicy
{
    /**
     * Fitur sakti Laravel: Fungsi 'before' akan dijalankan duluan sebelum fungsi lain.
     * Jika dia admin, beri izin (return true) untuk SEMUA tindakan (update, delete, dll).
     */
    public function before(User $user, $ability): bool|null
    {
        if ($user->role === 'admin') {
            return true;
        }
        
        return null; // Lanjut ke pengecekan normal di bawah kalau bukan admin
    }

    /**
     * Izin untuk mengupdate video.
     */
    public function update(User $user, VideoReel $videoReel): bool
    {
        // User biasa cuma boleh edit video miliknya sendiri
        return $user->id === $videoReel->user_id;
    }

    /**
     * Izin untuk menghapus video.
     */
    public function delete(User $user, VideoReel $videoReel): bool
    {
        // User biasa cuma boleh hapus video miliknya sendiri
        return $user->id === $videoReel->user_id;
    }
}