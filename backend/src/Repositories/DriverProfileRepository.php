<?php

namespace App\Repositories;

use App\Database;
use PDO;

class DriverProfileRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query(
            'SELECT dp.*, u.email, u.name, u.phone
             FROM driver_profiles dp
             JOIN users u ON u.id = dp.user_id
             ORDER BY dp.created_at DESC'
        );
        return $stmt->fetchAll();
    }

    public function findById(string $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT dp.*, u.email, u.name, u.phone
             FROM driver_profiles dp
             JOIN users u ON u.id = dp.user_id
             WHERE dp.id = :id'
        );
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByUserId(string $userId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM driver_profiles WHERE user_id = :user_id');
        $stmt->execute(['user_id' => $userId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(array $data): string
    {
        $stmt = $this->db->prepare(
            'INSERT INTO driver_profiles (user_id, code, license_number, license_type, license_expiration_date, availability, notes)
             VALUES (:user_id, :code, :license_number, :license_type, :license_expiration_date, :availability, :notes)
             RETURNING id'
        );
        $stmt->execute([
            'user_id'                  => $data['user_id'],
            'code'                     => $data['code'],
            'license_number'           => $data['license_number'],
            'license_type'             => $data['license_type'],
            'license_expiration_date'  => $data['license_expiration_date'],
            'availability'             => $data['availability'] ?? 'AVAILABLE',
            'notes'                    => $data['notes'] ?? null,
        ]);
        return $stmt->fetchColumn();
    }

    public function update(string $id, array $data): void
    {
        $fields = [];
        $params = ['id' => $id];

        foreach (['code', 'license_number', 'license_type', 'license_expiration_date', 'availability', 'notes'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (!empty($fields)) {
            $stmt = $this->db->prepare('UPDATE driver_profiles SET ' . implode(', ', $fields) . ' WHERE id = :id');
            $stmt->execute($params);
        }
    }

    public function delete(string $id): void
    {
        $stmt = $this->db->prepare('DELETE FROM driver_profiles WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }

    public function countAvailable(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) FROM driver_profiles WHERE availability = 'AVAILABLE'");
        return (int) $stmt->fetchColumn();
    }

    public function countAll(): int
    {
        $stmt = $this->db->query('SELECT COUNT(*) FROM driver_profiles');
        return (int) $stmt->fetchColumn();
    }

    public function findAllPaginated(int $page, int $perPage): array
    {
        $offset = ($page - 1) * $perPage;
        $stmt = $this->db->prepare(
            'SELECT dp.*, u.email, u.name, u.phone
             FROM driver_profiles dp
             JOIN users u ON u.id = dp.user_id
             ORDER BY dp.created_at DESC
             LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue('limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function nextCode(): string
    {
        $stmt = $this->db->query("SELECT COALESCE(MAX(SUBSTRING(code FROM 'DRV-(\d+)')::int), 0) + 1 AS next FROM driver_profiles");
        $next = $stmt->fetchColumn();
        return 'DRV-' . str_pad((string) $next, 3, '0', STR_PAD_LEFT);
    }
}
