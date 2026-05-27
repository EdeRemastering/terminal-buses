<?php

namespace App\Controllers;

use App\Helpers\JsonBodyTrait;
use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\TripService;
use RuntimeException;

class TripController
{
    use JsonBodyTrait;

    public function __construct(
        private TripService $tripService = new TripService(),
    ) {}

    public function index(): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY', 'DRIVER');
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(1000, max(1, (int) ($_GET['perPage'] ?? 100)));
        Response::success($this->tripService->getAll($page, $perPage));
    }

    public function show(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY', 'DRIVER');
        try {
            Response::success($this->tripService->getById($id));
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function store(): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
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
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        $input = $this->getJsonBody();

        try {
            Response::success($this->tripService->update($id, $input), 'Viaje actualizado');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function updateStatus(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
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
        AuthMiddleware::requireRole('ADMIN');
        try {
            $this->tripService->delete($id);
            Response::success(null, 'Viaje eliminado');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function addPassenger(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        $input = $this->getJsonBody();
        try {
            $passengers = $this->tripService->addPassenger($id, $input);
            Response::created($passengers, 'Pasajero agregado al viaje');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function removePassenger(string $id, string $pid): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        try {
            $this->tripService->removePassenger($id, $pid);
            Response::success(null, 'Pasajero eliminado del viaje');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function assignSeat(string $id, string $pid): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        $input = $this->getJsonBody();
        try {
            $result = $this->tripService->assignSeat($id, $pid, $input);
            Response::success($result, 'Asiento asignado');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function clearSeat(string $id, string $pid): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        try {
            $result = $this->tripService->clearSeat($id, $pid);
            Response::success($result, 'Asiento liberado');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

}
