<?php

namespace App\Helpers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use RuntimeException;

class JwtHelper
{
    private static ?array $config = null;

    private static function config(): array
    {
        if (self::$config === null) {
            self::$config = require __DIR__ . '/../../config/jwt.php';
        }
        return self::$config;
    }

    public static function encode(array $payload): string
    {
        $config = self::config();

        $now = time();
        $payload = array_merge([
            'iss' => $config['issuer'],
            'iat' => $now,
            'exp' => $now + $config['expires_in'],
        ], $payload);

        return JWT::encode($payload, $config['secret'], $config['algorithm']);
    }

    public static function decode(string $token): object
    {
        $config = self::config();

        try {
            return JWT::decode($token, new Key($config['secret'], $config['algorithm']));
        } catch (ExpiredException) {
            // FIXME: podria intentar renovar el token en vez de rechazar de una
            throw new RuntimeException('El token ha expirado');
        } catch (\Exception) {
            throw new RuntimeException('Token inv�lido');
        }
    }
}
