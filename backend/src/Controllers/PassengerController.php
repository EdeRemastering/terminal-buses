<?php

namespace App\Controllers;

use App\Helpers\JsonBodyTrait;
use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\PassengerService;
use RuntimeException;

class PassengerController
{
    use JsonBodyTrait;

    public function __construct(
        private PassengerService $passengerService = new PassengerService(),
    ) {}

    public function index(): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY', 'DRIVER');
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(1000, max(1, (int) ($_GET['perPage'] ?? 100)));
        Response::success($this->passengerService->getAll($page, $perPage));
    }

    public function show(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY', 'DRIVER');
        try {
            Response::success($this->passengerService->getById($id));
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function store(): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        $input = $this->getJsonBody();

        $checks = [
            'name' => 'El nombre es requerido',
            'email' => 'El correo es requerido',
            'phone' => 'El teléfono es requerido',
            'documentId' => 'El documento de identidad es requerido',
        ];
        foreach ($checks as $field => $message) {
            if (empty($input[$field])) Response::error($message);
        }

        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Formato de correo inválido');
        }

        try {
            Response::created($this->passengerService->create($input), 'Pasajero creado');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function update(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN', 'SECRETARY');
        $input = $this->getJsonBody();

        try {
            Response::success($this->passengerService->update($id, $input), 'Pasajero actualizado');
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
            Response::success($this->passengerService->update($id, ['status' => $input['status']]), 'Estado del pasajero actualizado');
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function destroy(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN');
        try {
            $this->passengerService->delete($id);
            Response::success(null, 'Pasajero eliminado');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

}
