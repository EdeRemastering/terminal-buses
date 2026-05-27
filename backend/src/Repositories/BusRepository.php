<?php

namespace App\Repositories;

use App\Database;
use PDO;

class BusRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT * FROM buses ORDER BY created_at DESC');
        return $stmt->fetchAll();
    }

    public function findById(string $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM buses WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByCode(string $code): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM buses WHERE code = :code');
        $stmt->execute(['code' => $code]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByPlate(string $plate): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM buses WHERE plate = :plate');
        $stmt->execute(['plate' => $plate]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(array $data): string
    {
        $stmt = $this->db->prepare(
            'INSERT INTO buses (code, plate, model, capacity, type, year, mileage, last_maintenance_date, status, notes)
             VALUES (:code, :plate, :model, :capacity, :type, :year, :mileage, :last_maintenance_date, :status, :notes)
             RETURNING id'
        );
        $stmt->execute([
            'code'                 => $data['code'],
            'plate'                => $data['plate'],
            'model'                => $data['model'],
            'capacity'             => $data['capacity'],
            'type'                 => $data['type'],
            'year'                 => $data['year'],
            'mileage'              => $data['mileage'] ?? 0,
            'last_maintenance_date' => $data['last_maintenance_date'] ?? null,
            'status'               => $data['status'] ?? 'OPERATIONAL',
            'notes'                => $data['notes'] ?? null,
        ]);
        return $stmt->fetchColumn();
    }

    public function update(string $id, array $data): void
    {
        // Construye el UPDATE dinamicamente solo con los campos enviados
        $fields = [];
        $params = ['id' => $id];

        foreach (['code', 'plate', 'model', 'capacity', 'type', 'year', 'mileage', 'last_maintenance_date', 'status', 'notes'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (!empty($fields)) {
            $stmt = $this->db->prepare('UPDATE buses SET ' . implode(', ', $fields) . ' WHERE id = :id');
            $stmt->execute($params);
        }
    }

    public function delete(string $id): void
    {
        $stmt = $this->db->prepare('DELETE FROM buses WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }

    public function countOperational(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) FROM buses WHERE status = 'OPERATIONAL'");
        return (int) $stmt->fetchColumn();
    }

    public function countAll(): int
    {
        $stmt = $this->db->query('SELECT COUNT(*) FROM buses');
        return (int) $stmt->fetchColumn();
    }

    public function findAllPaginated(int $page, int $perPage): array
    {
        $offset = ($page - 1) * $perPage;
        $stmt = $this->db->prepare('SELECT * FROM buses ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue('limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function nextCode(): string
    {
        // Extrae el numero correlativo del codigo existente y le suma 1
        $stmt = $this->db->query("SELECT COALESCE(MAX(SUBSTRING(code FROM 'BUS-(\d+)')::int), 0) + 1 AS next FROM buses");
        $next = $stmt->fetchColumn();
        return 'BUS-' . str_pad((string) $next, 3, '0', STR_PAD_LEFT);
    }
}
