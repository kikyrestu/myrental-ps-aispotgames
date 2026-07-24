<?php

class CorsMiddleware
{
    /**
     * Dipanggil sekali di index.php, sebelum router dispatch.
     * Cuma izinin origin frontend yang ditentuin di .env (CORS_ORIGIN).
     */
    public static function handle(): void
    {
        $config = require __DIR__ . '/../config/database.php';
        $allowedOrigin = $config['cors_origin'];

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin === $allowedOrigin) {
            header("Access-Control-Allow-Origin: {$origin}");
        }

        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        // Preflight request — browser ngirim OPTIONS duluan sebelum request beneran
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
