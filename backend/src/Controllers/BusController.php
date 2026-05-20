<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\BusService;
use RuntimeException;

class BusController
{
    public function __construct(
        private BusService $busService = new BusService(),
    ) {}

    public function index(): void
    {
        AuthMiddleware::authenticate();
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(1000, max(1, (int) ($_GET['perPage'] ?? 100)));
        Response::success($this->busService->getAll($page, $perPage));
    }

    public function show(string $id): void
    {
        AuthMiddleware::authenticate();
        try {
            Response::success($this->busService->getById($id));
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function store(): void
    {
        AuthMiddleware::authenticate();
        $input = $this->parseJsonBody();

        $errors = [];
        if (empty($input['plate'])) $errors[] = 'La placa es requerida';
        if (empty($input['model'])) $errors[] = 'El modelo es requerido';
        if (empty($input['capacity']) || !is_numeric($input['capacity']) || (int)$input['capacity'] < 1) {
            $errors[] = 'La capacidad debe ser un número positivo';
        }
        // TODO: validar que la placa no exista ya en la BD antes de crear
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
        AuthMiddleware::authenticate();
        $input = $this->parseJsonBody();

        try {
            Response::success($this->busService->update($id, $input), 'Bus actualizado');
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function destroy(string $id): void
    {
        AuthMiddleware::authenticate();
        try {
            $this->busService->delete($id);
            Response::success(null, 'Bus eliminado');
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

    // HACK: este metodo se repite en TripController, deberia ir en un trait compartido
}
