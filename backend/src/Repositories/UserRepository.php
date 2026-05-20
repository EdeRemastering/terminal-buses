<?php

namespace App\Repositories;

use App\Database;
use PDO;

class UserRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = :email');
        $stmt->execute(['email' => $email]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findById(string $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT * FROM users ORDER BY created_at DESC');
        return $stmt->fetchAll();
    }

    public function create(array $data): string
    {
        $stmt = $this->db->prepare(
            'INSERT INTO users (email, name, password_hash, phone, role)
             VALUES (:email, :name, :password_hash, :phone, :role)
             RETURNING id'
        );
        $stmt->execute([
            'email'         => $data['email'],
            'name'          => $data['name'],
            'password_hash' => $data['password_hash'],
            'phone'         => $data['phone'] ?? null,
            'role'          => $data['role'] ?? 'SECRETARY',
        ]);
        return $stmt->fetchColumn();
    }

    public function update(string $id, array $data): void
    {
        $fields = [];
        $params = ['id' => $id];

        foreach (['email', 'name', 'phone', 'is_active'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (!empty($fields)) {
            $stmt = $this->db->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = :id');
            $stmt->execute($params);
        }
    }
}
