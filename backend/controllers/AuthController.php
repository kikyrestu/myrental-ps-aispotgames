<?php

class AuthController
{
    public function login(Request $request): void
    {
        $v = new Validator($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $userModel = new User();
        $user = $userModel->findByUsername($request->input('username'));

        if (!$user || !$userModel->verifyPassword($request->input('password'), $user['password_hash'])) {
            ResponseHelper::error('Username atau password salah', 401);
            return;
        }

        // regen session id — cegah session fixation
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['full_name'] = $user['full_name'];
        if (isset($user['owner_id'])) {
            $_SESSION['owner_id'] = $user['owner_id'];
        }

        ResponseHelper::success([
            'id'        => $user['id'],
            'username'  => $user['username'],
            'full_name' => $user['full_name'],
            'role'      => $user['role'],
            'owner_id'  => $user['owner_id'] ?? null,
        ], 'Login berhasil');
    }

    public function logout(Request $request): void
    {
        $_SESSION = [];
        session_destroy();
        ResponseHelper::success(null, 'Logout berhasil');
    }

    /**
     * Endpoint tambahan (di luar daftar awal plan) buat cek session yang lagi
     * aktif — dipakai frontend waktu app pertama kali dibuka biar gak perlu
     * login ulang tiap refresh. Kasih tau kalau lo pengen ini dibuang.
     */
    public function me(Request $request): void
    {
        if (empty($_SESSION['user_id'])) {
            ResponseHelper::error('Belum login', 401);
            return;
        }

        ResponseHelper::success([
            'id'        => $_SESSION['user_id'],
            'full_name' => $_SESSION['full_name'],
            'role'      => $_SESSION['role'],
            'owner_id'  => $_SESSION['owner_id'] ?? null,
        ]);
    }
}
