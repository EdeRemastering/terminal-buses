<?php

namespace App\Middleware;

class CorsMiddleware
{
    public static function handle(): void
    {
        // En produccion cambiar CORS_ORIGIN al dominio especifico
        $allowedOrigin = getenv('CORS_ORIGIN') ?: '*';
        header("Access-Control-Allow-Origin: $allowedOrigin");
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
