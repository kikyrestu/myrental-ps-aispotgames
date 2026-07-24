<?php
/**
 * Minimal .env loader — PHP native, no composer/vlucas dependency.
 * Baca file .env di root /backend dan taruh ke getenv()/$_ENV.
 */

function load_env(string $path): void
{
    if (!file_exists($path)) {
        return; // biarin fallback ke default di database.php
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (!str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        // buang tanda kutip kalau ada
        $value = trim($value, "\"'");

        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
    }
}

load_env(__DIR__ . '/../.env');

/**
 * Helper ambil env var dengan default value.
 */
function env(string $key, $default = null)
{
    $value = getenv($key);
    if ($value === false) {
        return $default;
    }
    // konversi string boolean
    $lower = strtolower($value);
    if ($lower === 'true') return true;
    if ($lower === 'false') return false;
    return $value;
}
