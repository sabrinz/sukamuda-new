<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Otp;
use App\Mail\RegisterOtpMail; 
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class RegisteredUserController extends Controller
{
    /**
     * TAHAP 1: Menerima Pendaftaran & Kirim OTP Awal (Aman)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed'],
        ]);

        // Gunakan random_int yang lebih aman dari rand()
        $rawOtp = random_int(100000, 999999);

        try {
            // Simpan OTP dalam bentuk Hash (Disandikan)
            Otp::updateOrCreate(
                ['email' => $request->email],
                [
                    'otp'        => Hash::make((string)$rawOtp),
                    'expires_at' => Carbon::now()->addMinutes(15)
                ]
            );

            // Kirim angka aslinya via Email
            Mail::to($request->email)->send(new RegisterOtpMail($request->name, $rawOtp));

            return response()->json([
                'status'  => 'success',
                'message' => 'OTP berhasil dikirim ke email'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal kirim email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * FITUR: Kirim Ulang OTP (Aman)
     */
    public function resendOtp(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        
        $rawOtp = random_int(100000, 999999);

        try {
            Otp::updateOrCreate(
                ['email' => $request->email],
                [
                    'otp'        => Hash::make((string)$rawOtp), 
                    'expires_at' => Carbon::now()->addMinutes(15)
                ]
            );

            Mail::to($request->email)->send(new RegisterOtpMail('User SukaMuda', $rawOtp));

            return response()->json([
                'status'  => 'success',
                'message' => 'Kode baru berhasil dikirim!'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal kirim ulang: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * TAHAP 2: Verifikasi OTP & Buat Akun (Aman dari Bypass)
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'otp'      => 'required|string|size:6',
            'name'     => 'required|string',
            'password' => 'required',
        ]);

        // 1. Cari data HANYA berdasarkan email dulu
        $otpData = Otp::where('email', $request->email)->first();

        // 2. Kalau emailnya tidak ada yang minta OTP, langsung tolak!
        if (!$otpData) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Sesi OTP tidak ditemukan atau sudah dihapus!'
            ], 422);
        }

        // 3. Cocokkan inputan user dengan Hash di database
        if (!Hash::check($request->otp, $otpData->otp)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kode OTP salah!'
            ], 422);
        }

        // 4. Cek apakah sudah kadaluwarsa
        if (Carbon::parse($otpData->expires_at)->isPast()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kode OTP sudah kadaluwarsa, silakan kirim ulang!'
            ], 422);
        }

        // 5. Cek apakah email sudah terlanjur jadi User
        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Email ini sudah terdaftar.'
            ], 422);
        }

        // 6. Jika semua lolos, eksekusi pembuatan akun
        try {
            $user = User::create([
                'name'              => $request->name,
                'email'             => $request->email,
                'password'          => Hash::make($request->password),
                'email_verified_at' => Carbon::now(),
            ]);

           $otpData->delete();

// Buat token Sanctum buat dikirim ke frontend
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status'  => 'success',
                'message' => 'Verifikasi berhasil, akun telah aktif!',
                'user'    => $user,
                'token'   => $token
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Proses pembuatan akun gagal: ' . $e->getMessage()
            ], 500);
        }
    }
}