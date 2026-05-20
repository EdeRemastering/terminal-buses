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
