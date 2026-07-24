<?php

/**
 * Registry kecil buat metain nama middleware ('auth', 'admin') ke class asli.
 * Dipanggil dari Router::dispatch() sebelum controller method dieksekusi.
 * Return false => middleware udah kirim response sendiri (401/403), stop di situ.
 */
class Middleware
{
    public static function run(string $name, Request $request): bool
    {
        return match ($name) {
            'auth'  => AuthMiddleware::handle($request),
            'admin' => AuthMiddleware::requireRole($request, 'admin'),
            'kasir' => AuthMiddleware::requireRole($request, 'kasir', 'admin'),
            default => true,
        };
    }
}
