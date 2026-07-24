<?php
/**
 * Konfigurasi koneksi database.
 * Nilai diambil dari .env, fallback ke default di bawah.
 */

return [
    'host'    => env('DB_HOST', '127.0.0.1'),
    'port'    => env('DB_PORT', '3306'),
    'name'    => env('DB_NAME', 'rental_ps'),
    'user'    => env('DB_USER', 'root'),
    'pass'    => env('DB_PASS', ''),
    'charset' => 'utf8mb4',

    // CORS: origin frontend yang diizinkan (React dev server / build production)
    'cors_origin' => env('CORS_ORIGIN', 'http://localhost:5173'),

    // Session
    'session_lifetime' => (int) env('SESSION_LIFETIME', 28800), // detik, default 8 jam (1 shift)
];
