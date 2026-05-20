<?php

namespace App\Repositories;

use App\Database;
use PDO;

class RouteStopRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findByRouteId(string $routeId): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM route_stops WHERE route_id = :route_id ORDER BY stop_order ASC'
        );
        $stmt->execute(['route_id' => $routeId]);
        return $stmt->fetchAll();
    }

    public function create(array $data): string
    {
        $stmt = $this->db->prepare(
            'INSERT INTO route_stops (route_id, city, stop_order, estimated_minutes_from_prev)
             VALUES (:route_id, :city, :stop_order, :estimated_minutes_from_prev)
             RETURNING id'
        );
        $stmt->execute([
            'route_id'                  => $data['route_id'],
            'city'                      => $data['city'],
            'stop_order'                => $data['stop_order'],
            'estimated_minutes_from_prev' => $data['estimated_minutes_from_prev'] ?? null,
        ]);
        return $stmt->fetchColumn();
    }

    public function deleteByRouteId(string $routeId): void
    {
        $stmt = $this->db->prepare('DELETE FROM route_stops WHERE route_id = :route_id');
        $stmt->execute(['route_id' => $routeId]);
    }
}
