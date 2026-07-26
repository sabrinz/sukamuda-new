<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function sendResetOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Email tidak terdaftar!'], 404);
        }
        
        $otp = random_int(100000, 999999);
        
        DB::table('otps')->updateOrInsert(
            ['email' => $request->email],
            [
                'otp' => Hash::make($otp), 
                'expires_at' => now()->addMinutes(15), 
                'created_at' => now(),
            ]
        );

        try {
            Mail::to($request->email)->send(new ResetPasswordMail($otp));
            return response()->json(['message' => 'OTP berhasil dikirim ke email!']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal kirim: ' . $e->getMessage()], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required',
            'password' => 'required|min:8'
        ]);

        // 4. AMBIL DATA OTP BERDASARKAN EMAIL SAJA
        $check = DB::table('otps')->where('email', $request->email)->first();

        // 5. CEK APAKAH OTP ADA, DAN CEK APAKAH SUDAH KADALUARSA
        if (!$check || now()->greaterThan($check->expires_at)) {
            return response()->json(['message' => 'OTP salah atau sudah expired!'], 400);
        }

        // 6. BANDINGKAN INPUT OTP DENGAN HASH YANG ADA DI DATABASE
        if (!Hash::check($request->otp, $check->otp)) {
            return response()->json(['message' => 'OTP salah atau sudah expired!'], 400);
        }

        // Kalau semua pengecekan lolos, baru update password
        $user = User::where('email', $request->email)->first();
        $user->update(['password' => Hash::make($request->password)]);

        // Hapus OTP setelah berhasil dipakai
        DB::table('otps')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Sandi berhasil diubah!']);
    }
}