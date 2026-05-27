<?php

namespace App\Repositories;

use App\Database;
use PDO;

class TripRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query(
            'SELECT t.*, r.name AS route_name, r.origin, r.destination,
                    b.code AS bus_code, b.capacity,
                    dp.code AS driver_code, u.name AS driver_name
             FROM trips t
             JOIN routes r ON r.id = t.route_id
             JOIN buses b ON b.id = t.bus_id
             LEFT JOIN driver_profiles dp ON dp.id = t.driver_profile_id
             LEFT JOIN users u ON u.id = dp.user_id
             ORDER BY t.departure_time DESC'
        );
        return $stmt->fetchAll();
    }

    public function findAllPaginated(int $page, int $perPage): array
    {
        $offset = ($page - 1) * $perPage;
        $stmt = $this->db->prepare(
            'SELECT t.*, r.name AS route_name, r.origin, r.destination,
                    b.code AS bus_code, b.capacity,
                    dp.code AS driver_code, u.name AS driver_name
             FROM trips t
             JOIN routes r ON r.id = t.route_id
             JOIN buses b ON b.id = t.bus_id
             LEFT JOIN driver_profiles dp ON dp.id = t.driver_profile_id
             LEFT JOIN users u ON u.id = dp.user_id
             ORDER BY t.departure_time DESC
             LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue('limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function countActive(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) FROM trips WHERE status IN ('BOARDING', 'IN_PROGRESS')");
        return (int) $stmt->fetchColumn();
    }

    public function countTripsToday(): int
    {
        $stmt = $this->db->query(
            "SELECT COUNT(*) FROM trips WHERE departure_time >= CURRENT_DATE AND departure_time < CURRENT_DATE + INTERVAL '1 day'"
        );
        return (int) $stmt->fetchColumn();
    }

    public function findRecentTrips(int $limit = 5): array
    {
        $stmt = $this->db->prepare(
            'SELECT t.*, r.origin, r.destination, b.code AS bus_code
             FROM trips t
             JOIN routes r ON r.id = t.route_id
             JOIN buses b ON b.id = t.bus_id
             ORDER BY t.departure_time DESC
             LIMIT :limit'
        );
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getAvgOccupancy(): float
    {
        $stmt = $this->db->query(
            'SELECT COALESCE(AVG(occupied_seats::float / NULLIF(capacity, 0)), 0) AS avg_occupancy
             FROM trip_occupancy'
        );
        return (float) $stmt->fetchColumn();
    }

    public function countAll(): int
    {
        $stmt = $this->db->query('SELECT COUNT(*) FROM trips');
        return (int) $stmt->fetchColumn();
    }

    public function findOccupancyByCodes(array $codes): array
    {
        if (empty($codes)) return [];

        $placeholders = [];
        $params = [];
        foreach ($codes as $i => $code) {
            $placeholders[] = ":code_$i";
            $params["code_$i"] = $code;
        }

        $stmt = $this->db->prepare(
            'SELECT trip_code, available_seats FROM trip_occupancy WHERE trip_code IN (' . implode(',', $placeholders) . ')'
        );
        $stmt->execute($params);

        $map = [];
        foreach ($stmt->fetchAll() as $row) {
            $map[$row['trip_code']] = (int) $row['available_seats'];
        }
        return $map;
    }

    public function findByDriverProfileId(string $driverProfileId, array $statuses = []): array
    {
        $sql = 'SELECT t.*, r.name AS route_name, r.origin, r.destination,
                       b.code AS bus_code, b.capacity,
                       dp.code AS driver_code, u.name AS driver_name
                FROM trips t
                JOIN routes r ON r.id = t.route_id
                JOIN buses b ON b.id = t.bus_id
                LEFT JOIN driver_profiles dp ON dp.id = t.driver_profile_id
                LEFT JOIN users u ON u.id = dp.user_id
                WHERE t.driver_profile_id = :driver_profile_id';

        $params = ['driver_profile_id' => $driverProfileId];

        if (!empty($statuses)) {
            $placeholders = [];
            foreach ($statuses as $i => $s) {
                $placeholders[] = ":status_$i";
                $params["status_$i"] = $s;
            }
            $sql .= ' AND t.status IN (' . implode(',', $placeholders) . ')';
        }

        $sql .= ' ORDER BY t.departure_time DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function countActiveByBusId(string $busId): int
    {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM trips
             WHERE bus_id = :bus_id
               AND status NOT IN ('FINISHED', 'CANCELLED')"
        );
        $stmt->execute(['bus_id' => $busId]);
        return (int) $stmt->fetchColumn();
    }

    public function countActiveByDriverProfileId(string $driverProfileId): int
    {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM trips
             WHERE driver_profile_id = :driver_profile_id
               AND status NOT IN ('FINISHED', 'CANCELLED')"
        );
        $stmt->execute(['driver_profile_id' => $driverProfileId]);
        return (int) $stmt->fetchColumn();
    }

    public function countActiveByRouteId(string $routeId): int
    {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM trips
             WHERE route_id = :route_id
               AND status NOT IN ('FINISHED', 'CANCELLED')"
        );
        $stmt->execute(['route_id' => $routeId]);
        return (int) $stmt->fetchColumn();
    }

    public function existsOverlappingBusTrip(string $busId, string $departureTime, string $arrivalTime, ?string $excludeTripId = null): bool
    {
        $sql = "SELECT COUNT(*) FROM trips
                WHERE bus_id = :bus_id
                  AND status NOT IN ('FINISHED', 'CANCELLED')
                  AND departure_time < :arrival_time
                  AND arrival_time > :departure_time";
        $params = [
            'bus_id'         => $busId,
            'departure_time' => $departureTime,
            'arrival_time'   => $arrivalTime,
        ];

        if ($excludeTripId !== null) {
            $sql .= " AND id != :exclude_id";
            $params['exclude_id'] = $excludeTripId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn() > 0;
    }

    public function existsOverlappingDriverTrip(string $driverProfileId, string $departureTime, string $arrivalTime, ?string $excludeTripId = null): bool
    {
        $sql = "SELECT COUNT(*) FROM trips
                WHERE driver_profile_id = :driver_profile_id
                  AND status NOT IN ('FINISHED', 'CANCELLED')
                  AND departure_time < :arrival_time
                  AND arrival_time > :departure_time";
        $params = [
            'driver_profile_id' => $driverProfileId,
            'departure_time'    => $departureTime,
            'arrival_time'      => $arrivalTime,
        ];

        if ($excludeTripId !== null) {
            $sql .= " AND id != :exclude_id";
            $params['exclude_id'] = $excludeTripId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn() > 0;
    }

    public function findByBusId(string $busId): array
    {
        $stmt = $this->db->prepare(
            'SELECT t.*, r.name AS route_name, r.origin, r.destination,
                    b.code AS bus_code, b.capacity,
                    dp.code AS driver_code, u.name AS driver_name
             FROM trips t
             JOIN routes r ON r.id = t.route_id
             JOIN buses b ON b.id = t.bus_id
             LEFT JOIN driver_profiles dp ON dp.id = t.driver_profile_id
             LEFT JOIN users u ON u.id = dp.user_id
             WHERE t.bus_id = :bus_id
             ORDER BY t.departure_time DESC'
        );
        $stmt->execute(['bus_id' => $busId]);
        return $stmt->fetchAll();
    }

    public function findById(string $id): ?array
    {
        // LEFT JOIN porque un viaje puede no tener conductor asignado aun
        $stmt = $this->db->prepare(
            'SELECT t.*, r.name AS route_name, r.origin, r.destination,
                    b.code AS bus_code, b.capacity,
                    dp.code AS driver_code, u.name AS driver_name
             FROM trips t
             JOIN routes r ON r.id = t.route_id
             JOIN buses b ON b.id = t.bus_id
             LEFT JOIN driver_profiles dp ON dp.id = t.driver_profile_id
             LEFT JOIN users u ON u.id = dp.user_id
             WHERE t.id = :id'
        );
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(array $data): string
    {
        $stmt = $this->db->prepare(
            'INSERT INTO trips (code, route_id, bus_id, driver_profile_id, departure_time, arrival_time, price, status, notes)
             VALUES (:code, :route_id, :bus_id, :driver_profile_id, :departure_time, :arrival_time, :price, :status, :notes)
             RETURNING id'
        );
        $stmt->execute([
            'code'              => $data['code'],
            'route_id'          => $data['route_id'],
            'bus_id'            => $data['bus_id'],
            'driver_profile_id' => $data['driver_profile_id'] ?? null,
            'departure_time'    => $data['departure_time'],
            'arrival_time'      => $data['arrival_time'],
            'price'             => $data['price'],
            'status'            => $data['status'] ?? 'PENDING',
            'notes'             => $data['notes'] ?? null,
        ]);
        return $stmt->fetchColumn();
    }

    public function update(string $id, array $data): void
    {
        // Misma tecnica de UPDATE dinamico que en BusRepository
        $fields = [];
        $params = ['id' => $id];

        foreach (['route_id', 'bus_id', 'driver_profile_id', 'departure_time', 'arrival_time', 'price', 'status', 'notes'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (!empty($fields)) {
            $stmt = $this->db->prepare('UPDATE trips SET ' . implode(', ', $fields) . ' WHERE id = :id');
            $stmt->execute($params);
        }
    }

    public function updateStatus(string $id, string $status): void
    {
        $stmt = $this->db->prepare('UPDATE trips SET status = :status WHERE id = :id');
        $stmt->execute(['id' => $id, 'status' => $status]);
    }

    public function delete(string $id): void
    {
        $stmt = $this->db->prepare('DELETE FROM trips WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }

    public function nextCode(): string
    {
        $stmt = $this->db->query("SELECT COALESCE(MAX(SUBSTRING(code FROM 'TRIP-(\d+)')::int), 0) + 1 AS next FROM trips");
        $next = $stmt->fetchColumn();
        return 'TRIP-' . str_pad((string) $next, 3, '0', STR_PAD_LEFT);
    }
}
