<?php

class AuthMiddleware
{
    /**
     * Pastikan ada session user yang login. Session di-set waktu login berhasil
     * di AuthController::login().
     */
    public static function handle(Request $request): bool
    {
        if (empty($_SESSION['user_id'])) {
            Response::json(['success' => false, 'message' => 'Belum login / session habis'], 401);
            return false;
        }
        return true;
    }

    /**
     * Cek role. Panggil setelah handle() (Router jalanin 'auth' middleware duluan
     * kalau route juga butuh 'admin'/'kasir').
     */
    public static function requireRole(Request $request, string ...$allowedRoles): bool
    {
        if (empty($_SESSION['user_id'])) {
            Response::json(['success' => false, 'message' => 'Belum login / session habis'], 401);
            return false;
        }

        if (!in_array($_SESSION['role'], $allowedRoles, true)) {
            Response::json(['success' => false, 'message' => 'Akses ditolak untuk role ini'], 403);
            return false;
        }

        return true;
    }
}
