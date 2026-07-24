<?php

/**
 * Wrapper di atas core/Response.php buat bentuk JSON yang konsisten
 * di semua endpoint: { success, message, data } atau { success, message, errors }.
 */
class ResponseHelper
{
    public static function success($data = null, string $message = 'OK', int $status = 200): void
    {
        Response::json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    public static function error(string $message = 'Terjadi kesalahan', int $status = 400, ?array $errors = null): void
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];
        if ($errors !== null) {
            $payload['errors'] = $errors;
        }
        Response::json($payload, $status);
    }

    public static function notFound(string $message = 'Data tidak ditemukan'): void
    {
        self::error($message, 404);
    }

    public static function validationError(array $errors): void
    {
        self::error('Input tidak valid', 422, $errors);
    }
}
