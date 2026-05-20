<?php

namespace App\Helpers;

class Response
{
    private static function send(mixed $data, int $status): never
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        exit;
    }

    // TODO: agregar helper para respuestas paginadas (total, page, perPage)

    public static function success(mixed $data = null, string $message = 'Éxito', int $status = 200): never
    {
        self::send([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    public static function created(mixed $data = null, string $message = 'Creado'): never
    {
        self::success($data, $message, 201);
    }

    public static function error(string $message, int $status = 400, ?array $errors = null): never
    {
        $body = [
            'success' => false,
            'message' => $message,
        ];
        if ($errors !== null) {
            $body['errors'] = $errors;
        }
        self::send($body, $status);
    }

    public static function notFound(string $message = 'Recurso no encontrado'): never
    {
        self::error($message, 404);
    }

    public static function unauthorized(string $message = 'No autorizado'): never
    {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Prohibido'): never
    {
        self::error($message, 403);
    }
}
