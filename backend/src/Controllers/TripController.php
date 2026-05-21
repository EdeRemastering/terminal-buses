<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\TripService;
use RuntimeException;

class TripController
{
    public function __construct(
        private TripService $tripService = new TripService(),
    ) {}

    public function index(): void
    {
        AuthMiddleware::authenticate();
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(1000, max(1, (int) ($_GET['perPage'] ?? 100)));
        Response::success($this->tripService->getAll($page, $perPage));
    }

    public function show(string $id): void
    {
        AuthMiddleware::authenticate();
        try {
            Response::success($this->tripService->getById($id));
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function store(): void
    {
        AuthMiddleware::authenticate();
        $input = $this->getJsonBody();

        // Acepta tanto routeId/routeCode como busId/busCode para flexibilidad
        if (empty($input['routeId']) && empty($input['routeCode'])) {
            Response::error('El código de ruta es requerido');
        }
        if (empty($input['busId']) && empty($input['busCode'])) {
            Response::error('El código del bus es requerido');
        }
        if (empty($input['departureDate']) || empty($input['departureTime'])) {
            Response::error('La fecha y hora de salida son requeridas');
        }

        try {
            Response::created($this->tripService->create($input), 'Viaje creado');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function update(string $id): void
    {
        AuthMiddleware::authenticate();
        $input = $this->getJsonBody();

        try {
            Response::success($this->tripService->update($id, $input), 'Viaje actualizado');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function updateStatus(string $id): void
    {
        AuthMiddleware::authenticate();
        $input = $this->getJsonBody();

        if (empty($input['status'])) {
            Response::error('El estado es requerido');
        }

        try {
            Response::success($this->tripService->updateStatus($id, $input['status']), 'Estado del viaje actualizado');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function destroy(string $id): void
    {
        AuthMiddleware::authenticate();
        try {
            $this->tripService->delete($id);
            Response::success(null, 'Viaje eliminado');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    private function getJsonBody(): array
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) {
            Response::error('Cuerpo JSON inválido o vacío');
        }
        return $input;
    }
}
