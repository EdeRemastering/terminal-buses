<?php

namespace App\Services;

use App\Repositories\RouteRepository;
use App\Repositories\RouteStopRepository;
use App\Repositories\TripRepository;
use RuntimeException;

class RouteService
{
    public function __construct(
        private RouteRepository $routeRepo = new RouteRepository(),
        private RouteStopRepository $stopRepo = new RouteStopRepository(),
        private TripRepository $tripRepo = new TripRepository(),
    ) {}

    public function getAll(int $page = 1, int $perPage = 100): array
    {
        if ($perPage > 1000) $perPage = 1000;
        $routes = $this->routeRepo->findAllPaginated($page, $perPage);
        return array_map(fn($r) => $this->format($r), $routes);
    }

    public function getById(string $id): array
    {
        $route = $this->routeRepo->findById($id);
        if (!$route) throw new RuntimeException('Ruta no encontrada');
        return $this->format($route);
    }

    public function create(array $data): array
    {
        if (empty($data['name']) || empty($data['origin']) || empty($data['destination'])) {
            throw new RuntimeException('Nombre, origen y destino son requeridos');
        }

        if (strtolower(trim($data['origin'])) === strtolower(trim($data['destination']))) {
            throw new RuntimeException('El origen y el destino deben ser diferentes');
        }

        if ($this->routeRepo->findByName($data['name'])) {
            throw new RuntimeException('El nombre de ruta "' . $data['name'] . '" ya está registrado');
        }

        if (!isset($data['distanceKm']) || !is_numeric($data['distanceKm']) || (float)$data['distanceKm'] <= 0) {
            throw new RuntimeException('La distancia debe ser un número mayor a 0');
        }
        if (!isset($data['durationHours']) || !is_numeric($data['durationHours']) || (float)$data['durationHours'] <= 0) {
            throw new RuntimeException('La duración debe ser un número mayor a 0');
        }
        if (!isset($data['basePrice']) || !is_numeric($data['basePrice']) || (float)$data['basePrice'] <= 0) {
            throw new RuntimeException('El precio base debe ser un número mayor a 0');
        }

        $stops = $data['stops'];
        if (is_string($stops)) {
            $stops = array_map('trim', explode(',', $stops));
        } elseif (!is_array($stops) || empty($stops)) {
            throw new RuntimeException('Al menos una parada es requerida');
        }

        $id = $this->routeRepo->create([
            'code'           => $this->routeRepo->nextCode(),
            'name'           => $data['name'],
            'origin'         => $data['origin'],
            'destination'    => $data['destination'],
            'distance_km'    => (float)$data['distanceKm'],
            'duration_hours' => (float)$data['durationHours'],
            'base_price'     => (float)$data['basePrice'],
        ]);

        $estimatedMinutes = isset($data['estimatedMinutes'])
            ? (is_string($data['estimatedMinutes']) ? array_map('trim', explode(',', $data['estimatedMinutes'])) : $data['estimatedMinutes'])
            : [];

        foreach ($stops as $order => $city) {
            if ($city !== '') {
                $this->stopRepo->create([
                    'route_id'                   => $id,
                    'city'                       => $city,
                    'stop_order'                 => $order + 1,
                    'estimated_minutes_from_prev' => $estimatedMinutes[$order] ?? null,
                ]);
            }
        }

        return $this->getById($id);
    }

    public function update(string $id, array $data): array
    {
        $route = $this->routeRepo->findById($id);
        if (!$route) throw new RuntimeException('Ruta no encontrada');

        if (array_key_exists('name', $data)) {
            $existing = $this->routeRepo->findByName($data['name']);
            if ($existing && $existing['id'] !== $id) {
                throw new RuntimeException('El nombre de ruta "' . $data['name'] . '" ya está registrado por otra ruta');
            }
        }

        $origin = $data['origin'] ?? $route['origin'];
        $destination = $data['destination'] ?? $route['destination'];
        if (strtolower(trim($origin)) === strtolower(trim($destination))) {
            throw new RuntimeException('El origen y el destino deben ser diferentes');
        }

        $this->routeRepo->update($id, $data);
        return $this->getById($id);
    }

    public function delete(string $id): void
    {
        $route = $this->routeRepo->findById($id);
        if (!$route) throw new RuntimeException('Ruta no encontrada');

        $activeTrips = $this->tripRepo->countActiveByRouteId($id);
        if ($activeTrips > 0) {
            throw new RuntimeException('No se puede eliminar la ruta porque tiene ' . $activeTrips . ' viaje(s) activo(s)');
        }

        $this->routeRepo->delete($id);
    }

    private function format(array $route): array
    {
        $stops = $this->stopRepo->findByRouteId($route['id']);
        return [
            'id'            => $route['id'],
            'code'          => $route['code'],
            'name'          => $route['name'],
            'origin'        => $route['origin'],
            'destination'   => $route['destination'],
            'distanceKm'    => (float) $route['distance_km'],
            'durationHours' => (float) $route['duration_hours'],
            'basePrice'     => (float) $route['base_price'],
            'status'        => $route['status'],
            'stops'         => array_map(fn($s) => $s['city'], $stops),
        ];
    }
}
