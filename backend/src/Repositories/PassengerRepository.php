<?php

namespace App\Repositories;

use App\Database;
use PDO;

class PassengerRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT * FROM passengers ORDER BY created_at DESC');
        return $stmt->fetchAll();
    }

    public function findById(string $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM passengers WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM passengers WHERE email = :email');
        $stmt->execute(['email' => $email]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(array $data): string
    {
        $stmt = $this->db->prepare(
            'INSERT INTO passengers (code, name, email, phone, document_id, status, notes)
             VALUES (:code, :name, :email, :phone, :document_id, :status, :notes)
             RETURNING id'
        );
        $stmt->execute([
            'code'        => $data['code'],
            'name'        => $data['name'],
            'email'       => $data['email'],
            'phone'       => $data['phone'],
            'document_id' => $data['document_id'],
            'status'      => $data['status'] ?? 'ACTIVE',
            'notes'       => $data['notes'] ?? null,
        ]);
        return $stmt->fetchColumn();
    }

    public function update(string $id, array $data): void
    {
        $fields = [];
        $params = ['id' => $id];

        foreach (['name', 'email', 'phone', 'document_id', 'status', 'notes', 'frequent_traveler_points'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (!empty($fields)) {
            $stmt = $this->db->prepare('UPDATE passengers SET ' . implode(', ', $fields) . ' WHERE id = :id');
            $stmt->execute($params);
        }
    }

    public function delete(string $id): void
    {
        $stmt = $this->db->prepare('DELETE FROM passengers WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }

    public function countActive(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) FROM passengers WHERE status = 'ACTIVE'");
        return (int) $stmt->fetchColumn();
    }

    public function countAll(): int
    {
        $stmt = $this->db->query('SELECT COUNT(*) FROM passengers');
        return (int) $stmt->fetchColumn();
    }

    public function findAllPaginated(int $page, int $perPage): array
    {
        $offset = ($page - 1) * $perPage;
        $stmt = $this->db->prepare('SELECT * FROM passengers ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue('limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function nextCode(): string
    {
        $stmt = $this->db->query("SELECT COALESCE(MAX(SUBSTRING(code FROM 'PAS-(\d+)')::int), 0) + 1 AS next FROM passengers");
        $next = $stmt->fetchColumn();
        return 'PAS-' . str_pad((string) $next, 3, '0', STR_PAD_LEFT);
    }
}
