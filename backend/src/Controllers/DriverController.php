<?php

namespace App\Controllers;

use App\Helpers\JsonBodyTrait;
use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\DriverService;
use App\Services\TripService;
use RuntimeException;

class DriverController
{
    use JsonBodyTrait;

    public function __construct(
        private DriverService $driverService = new DriverService(),
        private TripService $tripService = new TripService(),
    ) {}

    public function myInfo(): void
    {
        $payload = AuthMiddleware::requireRole('DRIVER');

        try {
            $info = $this->driverService->getMyInfo($payload->sub);
            Response::success($info);
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function index(): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY', 'DRIVER');
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(1000, max(1, (int) ($_GET['perPage'] ?? 100)));
        Response::success($this->driverService->getAll($page, $perPage));
    }

    public function show(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        try {
            Response::success($this->driverService->getById($id));
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function store(): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        $input = $this->parseJsonBody();

        if (empty($input['name'])) Response::error('El nombre es requerido');
        if (empty($input['email'])) Response::error('El correo es requerido');
        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) Response::error('Formato de correo inválido');
        if (empty($input['licenseNumber'])) Response::error('El número de licencia es requerido');
        if (empty($input['licenseType'])) Response::error('El tipo de licencia es requerido');
        if (empty($input['licenseExpiration'])) Response::error('La fecha de vencimiento de la licencia es requerida');

        try {
            Response::created($this->driverService->create($input), 'Conductor creado');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function update(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        $input = $this->parseJsonBody();

        try {
            Response::success($this->driverService->update($id, $input), 'Conductor actualizado');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function updateAvailability(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        $input = $this->parseJsonBody();

        if (empty($input['availability'])) {
            Response::error('La disponibilidad es requerida');
        }

        try {
            Response::success($this->driverService->update($id, ['availability' => $input['availability']]), 'Disponibilidad del conductor actualizada');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function destroy(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN');
        try {
            $this->driverService->delete($id);
            Response::success(null, 'Conductor eliminado');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

}
