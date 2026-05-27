<?php

namespace App\Services;

use App\Helpers\JwtHelper;
use App\Repositories\UserRepository;
use RuntimeException;

class AuthService
{
    private UserRepository $userRepo;

    public function __construct()
    {
        $this->userRepo = new UserRepository();
    }

    public function login(string $email, string $password): array
    {
        $user = $this->userRepo->findByEmail($email);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new RuntimeException('Correo o contraseña inválidos');
        }

        if (!$user['is_active']) {
            throw new RuntimeException('La cuenta está inactiva');
        }

        $token = JwtHelper::encode([
            'sub'  => $user['id'],
            'role' => $user['role'],
        ]);

        return [
            'token' => $token,
            'user'  => [
                'id'    => $user['id'],
                'email' => $user['email'],
                'name'  => $user['name'],
                'role'  => $user['role'],
            ],
        ];
    }

    public function register(array $data): array
    {
        if ($this->userRepo->findByEmail($data['email'])) {
            throw new RuntimeException('El correo ya está registrado');
        }

        if (empty($data['password']) || strlen($data['password']) < 8) {
            throw new RuntimeException('La contraseña debe tener al menos 8 caracteres');
        }

        $role = $data['role'] ?? 'SECRETARY';
        if (!in_array($role, ['ADMIN', 'SECRETARY'], true)) {
            throw new RuntimeException('Rol inválido. Use ADMIN o SECRETARY');
        }

        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
        if ($passwordHash === false || $passwordHash === null) {
            throw new RuntimeException('Error al procesar la contraseña');
        }

        $id = $this->userRepo->create([
            'email'         => $data['email'],
            'name'          => $data['name'],
            'password_hash' => $passwordHash,
            'phone'         => $data['phone'] ?? null,
            'role'          => $role,
        ]);

        return $this->getCurrentUser($id);
    }

    public function getCurrentUser(string $userId): array
    {
        $user = $this->userRepo->findById($userId);

        if (!$user) {
            throw new RuntimeException('Usuario no encontrado');
        }

        return [
            'id'    => $user['id'],
            'email' => $user['email'],
            'name'  => $user['name'],
            'role'  => $user['role'],
        ];
    }
}
