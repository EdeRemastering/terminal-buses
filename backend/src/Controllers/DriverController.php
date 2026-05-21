<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\DriverService;
use RuntimeException;

class DriverController
{
    public function __construct(
        private DriverService $driverService = new DriverService(),
    ) {}

    public function index(): void
    {
        AuthMiddleware::authenticate();
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(1000, max(1, (int) ($_GET['perPage'] ?? 100)));
        Response::success($this->driverService->getAll($page, $perPage));
    }

    public function show(string $id): void
    {
        AuthMiddleware::authenticate();
        try {
            Response::success($this->driverService->getById($id));
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function store(): void
    {
        AuthMiddleware::authenticate();
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
        AuthMiddleware::authenticate();
        $input = $this->parseJsonBody();

        try {
            Response::success($this->driverService->update($id, $input), 'Conductor actualizado');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function destroy(string $id): void
    {
        AuthMiddleware::authenticate();
        try {
            $this->driverService->delete($id);
            Response::success(null, 'Conductor eliminado');
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
