<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\RouteService;
use RuntimeException;

class RouteController
{
    public function __construct(
        private RouteService $routeService = new RouteService(),
    ) {}

    public function index(): void
    {
        AuthMiddleware::authenticate();
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(1000, max(1, (int) ($_GET['perPage'] ?? 100)));
        Response::success($this->routeService->getAll($page, $perPage));
    }

    public function show(string $id): void
    {
        AuthMiddleware::authenticate();
        try {
            Response::success($this->routeService->getById($id));
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function store(): void
    {
        AuthMiddleware::authenticate();
        $input = $this->parseJsonBody();

        $missing = array_diff(['name', 'origin', 'destination'], array_keys($input));
        if ($missing) {
            Response::error('Campos requeridos faltantes: ' . implode(', ', $missing));
        }

        if (empty($input['stops'])) {
            Response::error('Al menos una parada es requerida');
        }

        try {
            Response::created($this->routeService->create($input), 'Ruta creada');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function update(string $id): void
    {
        AuthMiddleware::authenticate();
        $input = $this->parseJsonBody();

        try {
            Response::success($this->routeService->update($id, $input), 'Ruta actualizada');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function destroy(string $id): void
    {
        AuthMiddleware::authenticate();
        try {
            $this->routeService->delete($id);
            Response::success(null, 'Ruta eliminada');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    private function parseJsonBody(): array
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) {
            Response::error('Cuerpo JSON inválido o vacío');
        }
        return $input;
    }
}
