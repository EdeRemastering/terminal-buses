<?php

namespace App\Services;

use App\Repositories\BusRepository;
use RuntimeException;

class BusService
{
    public function __construct(
        private BusRepository $busRepo = new BusRepository(),
    ) {}

    public function getAll(int $page = 1, int $perPage = 100): array
    {
        // Evita que pidan 100k registros y maten la BD
        if ($perPage > 1000) $perPage = 1000;
        $buses = $this->busRepo->findAllPaginated($page, $perPage);
        return array_map(fn($b) => $this->format($b), $buses);
    }

    public function getById(string $id): array
    {
        $bus = $this->busRepo->findById($id);
        if (!$bus) throw new RuntimeException('Bus no encontrado');
        return $this->format($bus);
    }

    public function create(array $data): array
    {
        $required = ['plate' => 'Placa', 'model' => 'Modelo', 'capacity' => 'Capacidad'];
        foreach ($required as $field => $label) {
            if (empty($data[$field])) {
                throw new RuntimeException("$label es requerido");
            }
        }

        if (!is_numeric($data['capacity']) || (int)$data['capacity'] < 1) {
            throw new RuntimeException('La capacidad debe ser un número positivo');
        }

        $id = $this->busRepo->create([
            'code'                  => $this->busRepo->nextCode(),
            'plate'                 => $data['plate'],
            'model'                 => $data['model'],
            'capacity'              => $data['capacity'],
            'type'                  => $data['type'] ?? 'STANDARD',
            'year'                  => $data['year'] ?? date('Y'),
            'mileage'               => $data['mileage'] ?? 0,
            'last_maintenance_date' => $data['lastMaintenance'] ?? null,
            'status'                => 'OPERATIONAL',
        ]);

        return $this->getById($id);
    }

    public function update(string $id, array $data): array
    {
        $bus = $this->busRepo->findById($id);
        if (!$bus) throw new RuntimeException('Bus no encontrado');

        $this->busRepo->update($id, $data);
        return $this->getById($id);
    }

    public function delete(string $id): void
    {
        $bus = $this->busRepo->findById($id);
        if (!$bus) throw new RuntimeException('Bus no encontrado');

        $this->busRepo->delete($id);
    }

    private function format(array $bus): array
    {
        return [
            'id'              => $bus['id'],
            'code'            => $bus['code'],
            'plate'           => $bus['plate'],
            'model'           => $bus['model'],
            'capacity'        => (int) $bus['capacity'],
            'status'          => $bus['status'],
            'type'            => $bus['type'],
            'year'            => (int) $bus['year'],
            'mileage'         => (float) $bus['mileage'],
            'lastMaintenance' => $bus['last_maintenance_date'],
        ];
    }
}
