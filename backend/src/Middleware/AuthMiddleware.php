<?php

namespace App\Middleware;

use App\Helpers\JwtHelper;
use App\Helpers\Response;
use RuntimeException;

class AuthMiddleware
{
    public static function authenticate(): object
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            Response::unauthorized('Missing or malformed authorization header');
        }

        try {
            return JwtHelper::decode($matches[1]);
        } catch (RuntimeException $e) {
            Response::unauthorized($e->getMessage());
        }
    }

    public static function requireRole(string ...$roles): object
    {
        $payload = self::authenticate();
        if (!in_array($payload->role, $roles, true)) {
            Response::forbidden('No tienes permiso para realizar esta acción');
        }
        return $payload;
    }
}
