<?php

namespace App\Services;

use App\Repositories\RouteRepository;
use App\Repositories\RouteStopRepository;
use RuntimeException;

class RouteService
{
    public function __construct(
        private RouteRepository $routeRepo = new RouteRepository(),
        private RouteStopRepository $stopRepo = new RouteStopRepository(),
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
            'distance_km'    => $data['distanceKm'] ?? 0,
            'duration_hours' => $data['durationHours'] ?? 0,
            'base_price'     => $data['basePrice'] ?? 0,
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

        $this->routeRepo->update($id, $data);
        return $this->getById($id);
    }

    public function delete(string $id): void
    {
        $route = $this->routeRepo->findById($id);
        if (!$route) throw new RuntimeException('Ruta no encontrada');

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
