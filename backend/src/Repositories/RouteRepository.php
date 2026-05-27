<?php

namespace App\Repositories;

use App\Database;
use PDO;

class RouteRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT * FROM routes ORDER BY created_at DESC');
        return $stmt->fetchAll();
    }

    public function findById(string $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM routes WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByName(string $name): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM routes WHERE name = :name');
        $stmt->execute(['name' => $name]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByCode(string $code): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM routes WHERE code = :code');
        $stmt->execute(['code' => $code]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(array $data): string
    {
        $stmt = $this->db->prepare(
            'INSERT INTO routes (code, name, origin, destination, distance_km, duration_hours, base_price, status, notes)
             VALUES (:code, :name, :origin, :destination, :distance_km, :duration_hours, :base_price, :status, :notes)
             RETURNING id'
        );
        $stmt->execute([
            'code'           => $data['code'],
            'name'           => $data['name'],
            'origin'         => $data['origin'],
            'destination'    => $data['destination'],
            'distance_km'    => $data['distance_km'],
            'duration_hours' => $data['duration_hours'],
            'base_price'     => $data['base_price'],
            'status'         => $data['status'] ?? 'ACTIVE',
            'notes'          => $data['notes'] ?? null,
        ]);
        return $stmt->fetchColumn();
    }

    public function update(string $id, array $data): void
    {
        $fields = [];
        $params = ['id' => $id];

        foreach (['code', 'name', 'origin', 'destination', 'distance_km', 'duration_hours', 'base_price', 'status', 'notes'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (!empty($fields)) {
            $stmt = $this->db->prepare('UPDATE routes SET ' . implode(', ', $fields) . ' WHERE id = :id');
            $stmt->execute($params);
        }
    }

    public function delete(string $id): void
    {
        $stmt = $this->db->prepare('DELETE FROM routes WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }

    public function countAll(): int
    {
        $stmt = $this->db->query('SELECT COUNT(*) FROM routes');
        return (int) $stmt->fetchColumn();
    }

    public function findAllPaginated(int $page, int $perPage): array
    {
        $offset = ($page - 1) * $perPage;
        $stmt = $this->db->prepare('SELECT * FROM routes ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue('limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function nextCode(): string
    {
        $stmt = $this->db->query("SELECT COALESCE(MAX(SUBSTRING(code FROM 'RUT-(\d+)')::int), 0) + 1 AS next FROM routes");
        $next = $stmt->fetchColumn();
        return 'RUT-' . str_pad((string) $next, 3, '0', STR_PAD_LEFT);
    }
}
