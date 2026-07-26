<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    /**
     * Menampilkan semua laporan masuk dengan Paginasi (Hanya untuk Admin)
     */
    public function index()
    {
        try {
            // PERBAIKAN: Menggunakan paginate(20) untuk optimasi memori server
            // Menarik data laporan beserta relasi user dan artikel terkait
            $reports = Report::with(['user:id,name,email', 'article:id,title,slug'])
                ->latest()
                ->paginate(20);

            // Cukup kembalikan objek paginasi langsung karena Laravel otomatis menyusun format JSON-nya
            return response()->json($reports);
        } catch (\Exception $e) {
            Log::error("Report Index Error: " . $e->getMessage());
            return response()->json([
                'message' => 'Gagal mengambil data laporan dari server.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan laporan baru dari pengguna (Protected Route)
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'article_id' => 'required|exists:articles,id',
                'reason' => 'required|string|max:1000',
            ]);

            $user = $request->user();

            // Cek apakah user sudah pernah melaporkan artikel ini sebelumnya
            $existingReport = Report::where('user_id', $user->id)
                ->where('article_id', $request->article_id)
                ->first();

            if ($existingReport) {
                return response()->json([
                    'message' => 'Anda sudah melaporkan artikel ini sebelumnya.'
                ], 400);
            }

            $report = Report::create([
                'user_id' => $user->id,
                'article_id' => $request->article_id,
                'reason' => $request->reason,
            ]);

            return response()->json([
                'message' => 'Laporan berhasil dikirim dan akan segera ditinjau.',
                'report' => $report
            ], 201);

        } catch (\Exception $e) {
            Log::error("Report Store Error: " . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengirimkan laporan.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}