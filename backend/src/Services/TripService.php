<?php

namespace App\Services;

use App\Repositories\TripRepository;
use App\Repositories\TripPassengerRepository;
use App\Repositories\TripHistoryRepository;
use App\Repositories\BusRepository;
use App\Repositories\RouteRepository;
use RuntimeException;

class TripService
{
    public function __construct(
        private TripRepository $tripRepo = new TripRepository(),
        private TripPassengerRepository $tripPassengerRepo = new TripPassengerRepository(),
        private TripHistoryRepository $historyRepo = new TripHistoryRepository(),
        private BusRepository $busRepo = new BusRepository(),
        private RouteRepository $routeRepo = new RouteRepository(),
    ) {}

    private function attachAvailableSeats(array &$trips): void
    {
        $codes = array_map(fn($t) => $t['code'] ?? $t['trip_code'] ?? '', $trips);
        $codes = array_values(array_filter($codes));

        if (empty($codes)) return;

        $occupancyMap = $this->tripRepo->findOccupancyByCodes($codes);

        foreach ($trips as &$t) {
            $code = $t['code'] ?? $t['trip_code'] ?? '';
            $t['available_seats'] = $occupancyMap[$code] ?? 0;
        }
    }

    public function getAll(int $page = 1, int $perPage = 100): array
    {
        if ($perPage > 1000) $perPage = 1000;
        $trips = $this->tripRepo->findAllPaginated($page, $perPage);
        $this->attachAvailableSeats($trips);
        return array_map(fn($t) => $this->format($t), $trips);
    }

    public function getById(string $id): array
    {
        $trip = $this->tripRepo->findById($id);
        if (!$trip) throw new RuntimeException('Viaje no encontrado');

        $wrapped = [$trip];
        $this->attachAvailableSeats($wrapped);

        $result = $this->format($wrapped[0]);
        $result['passengers'] = $this->tripPassengerRepo->findByTripId($trip['id']);
        $result['history'] = $this->historyRepo->findByTripId($trip['id']);

        return $result;
    }

    public function create(array $data): array
    {
        $routeCode = $data['routeCode'] ?? $data['routeId'] ?? null;
        $busCode = $data['busCode'] ?? $data['busId'] ?? null;

        if (!$routeCode || !$busCode) {
            throw new RuntimeException('El código de ruta y de bus son requeridos');
        }

        $route = $this->routeRepo->findByCode($routeCode);
        if (!$route) throw new RuntimeException('Ruta no encontrada: ' . $routeCode);

        $bus = $this->busRepo->findByCode($busCode);
        if (!$bus) throw new RuntimeException('Bus no encontrado: ' . $busCode);

        if (empty($data['departureDate']) || empty($data['departureTime'])) {
            throw new RuntimeException('La fecha y hora de salida son requeridas');
        }

        $departure = $data['departureDate'] . ' ' . $data['departureTime'];
        $arrival = ($data['arrivalDate'] ?? $data['departureDate']) . ' ' . ($data['arrivalTime'] ?? $data['departureTime']);
        // FIXME: si el viaje cruza la medianoche, arrivalDate deberia ser obligatorio
        if (strtotime($arrival) <= strtotime($departure)) {
            throw new RuntimeException('La hora de llegada debe ser posterior a la de salida');
        }

        if (!isset($data['price']) || !is_numeric($data['price']) || (float)$data['price'] < 0) {
            throw new RuntimeException('El precio es requerido y debe ser un número positivo');
        }

        $id = $this->tripRepo->create([
            'code'           => $this->tripRepo->nextCode(),
            'route_id'       => $route['id'],
            'bus_id'         => $bus['id'],
            'departure_time' => $data['departureDate'] . ' ' . $data['departureTime'] . ':00',
            'arrival_time'   => ($data['arrivalDate'] ?? $data['departureDate']) . ' ' . ($data['arrivalTime'] ?? $data['departureTime']) . ':00',
            'price'          => $data['price'],
            'status'         => 'PENDING',
        ]);

        return $this->getById($id);
    }

    public function update(string $id, array $data): array
    {
        $trip = $this->tripRepo->findById($id);
        if (!$trip) throw new RuntimeException('Viaje no encontrado');

        $this->tripRepo->update($id, $data);
        return $this->getById($id);
    }

    public function updateStatus(string $id, string $status): array
    {
        $valid = ['PENDING', 'BOARDING', 'IN_PROGRESS', 'FINISHED', 'CANCELLED'];
        if (!in_array($status, $valid)) {
            throw new RuntimeException('Estado inválido. Use: ' . implode(', ', $valid));
        }

        $trip = $this->tripRepo->findById($id);
        if (!$trip) throw new RuntimeException('Viaje no encontrado');

        $this->tripRepo->updateStatus($id, $status);
        return $this->getById($id);
    }

    public function delete(string $id): void
    {
        $trip = $this->tripRepo->findById($id);
        if (!$trip) throw new RuntimeException('Viaje no encontrado');

        $this->tripRepo->delete($id);
    }

    private function format(array $trip): array
    {
        return [
            'id'             => $trip['id'],
            'code'           => $trip['code'],
            'origin'         => $trip['origin'],
            'destination'    => $trip['destination'],
            'departureTime'  => $trip['departure_time'],
            'arrivalTime'    => $trip['arrival_time'],
            'busId'          => $trip['bus_code'],
            'price'          => (float) $trip['price'],
            'status'         => $trip['status'],
            'availableSeats' => (int) ($trip['available_seats'] ?? 0),
            'routeName'      => $trip['route_name'] ?? '',
            'driverName'     => $trip['driver_name'] ?? '',
            'capacity'       => (int) $trip['capacity'],
        ];
    }
}
