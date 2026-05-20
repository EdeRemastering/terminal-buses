<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\AuthService;
use RuntimeException;

class AuthController
{
    public function __construct(
        private AuthService $authService = new AuthService(),
    ) {}

    public function login(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) Response::error('Cuerpo JSON inválido');

        // Validacion basica antes de delegar al servicio
        if (empty($input['email']) || empty($input['password'])) {
            Response::error('El correo y la contraseña son requeridos');
        }

        try {
            Response::success(
                $this->authService->login($input['email'], $input['password']),
                'Inicio de sesión exitoso'
            );
        } catch (RuntimeException $e) {
            Response::unauthorized($e->getMessage());
        }
    }

    public function me(): void
    {
        $payload = AuthMiddleware::authenticate();

        try {
            $user = $this->authService->getCurrentUser($payload->sub);
            Response::success(['user' => $user]);
        } catch (RuntimeException $e) {
            Response::notFound($e->getMessage());
        }
    }

    public function logout(): void
    {
        AuthMiddleware::authenticate();
        Response::success(null, 'Sesión cerrada exitosamente');
    }
}
