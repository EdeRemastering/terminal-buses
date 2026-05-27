<?php

namespace App\Controllers;

use App\Helpers\JsonBodyTrait;
use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\RouteService;
use RuntimeException;

class RouteController
{
    use JsonBodyTrait;

    public function __construct(
        private RouteService $routeService = new RouteService(),
    ) {}

    public function index(): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY', 'DRIVER');
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(1000, max(1, (int) ($_GET['perPage'] ?? 100)));
        Response::success($this->routeService->getAll($page, $perPage));
    }

    public function show(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY', 'DRIVER');
        try {
            Response::success($this->routeService->getById($id));
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function store(): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
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
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        $input = $this->parseJsonBody();

        try {
            Response::success($this->routeService->update($id, $input), 'Ruta actualizada');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function updateStatus(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        $input = $this->parseJsonBody();

        if (empty($input['status'])) {
            Response::error('El estado es requerido');
        }

        try {
            Response::success($this->routeService->update($id, ['status' => $input['status']]), 'Estado de la ruta actualizado');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function destroy(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN');
        try {
            $this->routeService->delete($id);
            Response::success(null, 'Ruta eliminada');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

}
