<?php

/**
 * Router native sederhana.
 * Mendukung: GET/POST/PUT/PATCH/DELETE, path param {id}, dan middleware per-route.
 *
 * Contoh pakai:
 *   $router->get('/api/units', [UnitController::class, 'index']);
 *   $router->post('/api/units', [UnitController::class, 'store'], ['auth', 'admin']);
 *   $router->put('/api/units/{id}', [UnitController::class, 'update'], ['auth', 'admin']);
 */
class Router
{
    private array $routes = [];

    public function get(string $path, array $handler, array $middleware = []): void
    {
        $this->add('GET', $path, $handler, $middleware);
    }

    public function post(string $path, array $handler, array $middleware = []): void
    {
        $this->add('POST', $path, $handler, $middleware);
    }

    public function put(string $path, array $handler, array $middleware = []): void
    {
        $this->add('PUT', $path, $handler, $middleware);
    }

    public function patch(string $path, array $handler, array $middleware = []): void
    {
        $this->add('PATCH', $path, $handler, $middleware);
    }

    public function delete(string $path, array $handler, array $middleware = []): void
    {
        $this->add('DELETE', $path, $handler, $middleware);
    }

    private function add(string $method, string $path, array $handler, array $middleware): void
    {
        $this->routes[] = [
            'method'     => $method,
            'path'       => rtrim($path, '/') ?: '/',
            'handler'    => $handler,
            'middleware' => $middleware,
        ];
    }

    /**
     * Konversi "/api/units/{id}" jadi regex dengan named group.
     */
    private function toRegex(string $path): string
    {
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    public function dispatch(Request $request): void
    {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $request->method) {
                continue;
            }

            $regex = $this->toRegex($route['path']);
            if (preg_match($regex, $request->path, $matches)) {
                // ambil cuma named group (buang index numerik)
                $params = array_filter(
                    $matches,
                    fn($key) => !is_int($key),
                    ARRAY_FILTER_USE_KEY
                );
                $request->params = $params;

                // jalankan middleware berurutan
                foreach ($route['middleware'] as $mw) {
                    $result = Middleware::run($mw, $request);
                    if ($result === false) {
                        return; // middleware udah kirim response error + exit-kan flow
                    }
                }

                [$controllerClass, $method] = $route['handler'];
                $controller = new $controllerClass();
                $controller->$method($request);
                return;
            }
        }

        Response::json(['success' => false, 'message' => 'Endpoint tidak ditemukan'], 404);
    }
}
