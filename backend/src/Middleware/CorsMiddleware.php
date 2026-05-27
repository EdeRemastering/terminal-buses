<?php

namespace App\Middleware;

class CorsMiddleware
{
    public static function handle(): void
    {
        $allowedOrigin = getenv('CORS_ORIGIN');

        if (!$allowedOrigin) {
            $allowedOrigin = '*';
            error_log('[WARNING] CORS_ORIGIN no configurada. Usando "*" (solo para desarrollo)');
        }

        header("Access-Control-Allow-Origin: $allowedOrigin");
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
