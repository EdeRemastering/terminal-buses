<?php

namespace App\Services;

use App\Repositories\BusRepository;
use App\Repositories\TripRepository;
use RuntimeException;

class BusService
{
    public function __construct(
        private BusRepository $busRepo = new BusRepository(),
        private TripRepository $tripRepo = new TripRepository(),
    ) {}

    public function getTrips(string $id): array
    {
        $bus = $this->busRepo->findById($id);
        if (!$bus) throw new RuntimeException('Bus no encontrado');

        $trips = $this->tripRepo->findByBusId($id);
        return array_map(fn($t) => [
            'id'            => $t['id'],
            'code'          => $t['code'],
            'origin'        => $t['origin'],
            'destination'   => $t['destination'],
            'departureTime' => $t['departure_time'],
            'arrivalTime'   => $t['arrival_time'],
            'routeName'     => $t['route_name'],
            'driverName'    => $t['driver_name'] ?? '',
            'status'        => $t['status'],
        ], $trips);
    }

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

    private const VALID_BUS_STATUSES = ['OPERATIONAL', 'MAINTENANCE', 'OUT_OF_SERVICE'];

    public function create(array $data): array
    {
        $required = ['plate' => 'Placa', 'model' => 'Modelo', 'capacity' => 'Capacidad'];
        foreach ($required as $field => $label) {
            if (empty($data[$field])) {
                throw new RuntimeException("$label es requerido");
            }
        }

        $capacity = (int) $data['capacity'];
        if ($capacity < 10 || $capacity > 80) {
            throw new RuntimeException('La capacidad debe estar entre 10 y 80');
        }

        if ($this->busRepo->findByPlate($data['plate'])) {
            throw new RuntimeException('La placa "' . $data['plate'] . '" ya está registrada');
        }

        if (!empty($data['year'])) {
            $year = (int) $data['year'];
            if ($year < 2018 || $year > 2030) {
                throw new RuntimeException('El año debe estar entre 2018 y 2030');
            }
        }

        if (!empty($data['lastMaintenance'])) {
            if (strtotime($data['lastMaintenance']) > time()) {
                throw new RuntimeException('La fecha de último mantenimiento no puede ser futura');
            }
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

        if (array_key_exists('plate', $data)) {
            $existing = $this->busRepo->findByPlate($data['plate']);
            if ($existing && $existing['id'] !== $id) {
                throw new RuntimeException('La placa "' . $data['plate'] . '" ya está registrada por otro bus');
            }
        }

        if (array_key_exists('capacity', $data)) {
            $capacity = (int) $data['capacity'];
            if ($capacity < 10 || $capacity > 80) {
                throw new RuntimeException('La capacidad debe estar entre 10 y 80');
            }
        }

        if (array_key_exists('year', $data) && !empty($data['year'])) {
            $year = (int) $data['year'];
            if ($year < 2018 || $year > 2030) {
                throw new RuntimeException('El año debe estar entre 2018 y 2030');
            }
        }

        if (array_key_exists('lastMaintenance', $data) && !empty($data['lastMaintenance'])) {
            if (strtotime($data['lastMaintenance']) > time()) {
                throw new RuntimeException('La fecha de último mantenimiento no puede ser futura');
            }
        }

        if (array_key_exists('status', $data)) {
            if (!in_array($data['status'], self::VALID_BUS_STATUSES)) {
                throw new RuntimeException('Estado inválido. Use: ' . implode(', ', self::VALID_BUS_STATUSES));
            }
            if ($data['status'] === 'MAINTENANCE') {
                $activeTrips = $this->tripRepo->countActiveByBusId($id);
                if ($activeTrips > 0) {
                    throw new RuntimeException('No se puede poner en mantenimiento un bus con ' . $activeTrips . ' viaje(s) activo(s)');
                }
            }
        }

        $this->busRepo->update($id, $data);
        return $this->getById($id);
    }

    public function delete(string $id): void
    {
        $bus = $this->busRepo->findById($id);
        if (!$bus) throw new RuntimeException('Bus no encontrado');

        $activeTrips = $this->tripRepo->countActiveByBusId($id);
        if ($activeTrips > 0) {
            throw new RuntimeException('No se puede eliminar el bus porque tiene ' . $activeTrips . ' viaje(s) activo(s)');
        }

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
