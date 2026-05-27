<?php

namespace App\Controllers;

use App\Helpers\JsonBodyTrait;
use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\BusService;
use RuntimeException;

class BusController
{
    use JsonBodyTrait;

    public function __construct(
        private BusService $busService = new BusService(),
    ) {}

    public function index(): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY', 'DRIVER');
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(1000, max(1, (int) ($_GET['perPage'] ?? 100)));
        Response::success($this->busService->getAll($page, $perPage));
    }

    public function show(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY', 'DRIVER');
        try {
            Response::success($this->busService->getById($id));
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function store(): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        $input = $this->parseJsonBody();

        $errors = [];
        if (empty($input['plate'])) $errors[] = 'La placa es requerida';
        if (empty($input['model'])) $errors[] = 'El modelo es requerido';
        if (empty($input['capacity']) || !is_numeric($input['capacity']) || (int)$input['capacity'] < 1) {
            $errors[] = 'La capacidad debe ser un número positivo';
        }
        $validTypes = ['STANDARD', 'EXPRESS', 'LUXURY'];
        if (!empty($input['type']) && !in_array($input['type'], $validTypes)) {
            $errors[] = 'Tipo inválido. Use: ' . implode(', ', $validTypes);
        }
        if ($errors) {
            Response::error(implode(', ', $errors));
        }

        try {
            Response::created($this->busService->create($input), 'Bus creado');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function update(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        $input = $this->parseJsonBody();

        try {
            Response::success($this->busService->update($id, $input), 'Bus actualizado');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function destroy(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN');
        try {
            $this->busService->delete($id);
            Response::success(null, 'Bus eliminado');
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
            Response::success($this->busService->update($id, ['status' => $input['status']]), 'Estado del bus actualizado');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function trips(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY', 'DRIVER');
        try {
            Response::success($this->busService->getTrips($id));
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

}
