<?php

class Request
{
    public string $method;
    public string $path;
    public array $query;
    public array $body;
    public array $params = []; // diisi Router dari {id} dsb

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'];

        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        // buang prefix folder kalau backend dijalankan di subfolder
        $this->path = rtrim($uri, '/');
        if ($this->path === '') {
            $this->path = '/';
        }

        $this->query = $_GET;

        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw, true);
        $this->body = is_array($decoded) ? $decoded : [];
    }

    public function input(string $key, $default = null)
    {
        return $this->body[$key] ?? $this->query[$key] ?? $default;
    }

    public function param(string $key, $default = null)
    {
        return $this->params[$key] ?? $default;
    }

    public function all(): array
    {
        return array_merge($this->query, $this->body);
    }

    public function bearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(\S+)/', $header, $m)) {
            return $m[1];
        }
        return null;
    }
}
