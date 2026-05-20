<?php

require_once __DIR__ . '/../vendor/autoload.php';

// Carga manual del .env sin usar librerias externas (vlucas/phpdotnet)
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        if (str_contains($line, '=')) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

error_reporting(E_ALL);
ini_set('display_errors', '0');

set_exception_handler(function (Throwable $e) {
    error_log($e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
    ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
});

use App\Helpers\Router;
use App\Middleware\CorsMiddleware;
use App\Controllers\AuthController;
use App\Controllers\BusController;
use App\Controllers\DriverController;
use App\Controllers\PassengerController;
use App\Controllers\RouteController;
use App\Controllers\TripController;
use App\Controllers\DashboardController;

CorsMiddleware::handle();

$router = new Router();
$prefix = '/api/v1';

$router->post("$prefix/auth/login",    [AuthController::class, 'login']);
$router->get("$prefix/auth/me",         [AuthController::class, 'me']);
$router->post("$prefix/auth/logout",    [AuthController::class, 'logout']);

$router->get("$prefix/buses",           [BusController::class, 'index']);
$router->get("$prefix/buses/{id}",      [BusController::class, 'show']);
$router->post("$prefix/buses",          [BusController::class, 'store']);
$router->put("$prefix/buses/{id}",      [BusController::class, 'update']);
$router->delete("$prefix/buses/{id}",   [BusController::class, 'destroy']);

$router->get("$prefix/drivers",          [DriverController::class, 'index']);
$router->get("$prefix/drivers/{id}",     [DriverController::class, 'show']);
$router->post("$prefix/drivers",         [DriverController::class, 'store']);
$router->put("$prefix/drivers/{id}",     [DriverController::class, 'update']);
$router->delete("$prefix/drivers/{id}",  [DriverController::class, 'destroy']);

$router->get("$prefix/passengers",          [PassengerController::class, 'index']);
$router->get("$prefix/passengers/{id}",     [PassengerController::class, 'show']);
$router->post("$prefix/passengers",         [PassengerController::class, 'store']);
$router->put("$prefix/passengers/{id}",     [PassengerController::class, 'update']);
$router->delete("$prefix/passengers/{id}",  [PassengerController::class, 'destroy']);

$router->get("$prefix/routes",          [RouteController::class, 'index']);
$router->get("$prefix/routes/{id}",     [RouteController::class, 'show']);
$router->post("$prefix/routes",         [RouteController::class, 'store']);
$router->put("$prefix/routes/{id}",     [RouteController::class, 'update']);
$router->delete("$prefix/routes/{id}",  [RouteController::class, 'destroy']);

$router->get("$prefix/trips",           [TripController::class, 'index']);
$router->get("$prefix/trips/{id}",      [TripController::class, 'show']);
$router->post("$prefix/trips",          [TripController::class, 'store']);
$router->put("$prefix/trips/{id}",       [TripController::class, 'update']);
$router->patch("$prefix/trips/{id}/status", [TripController::class, 'updateStatus']);
$router->delete("$prefix/trips/{id}",   [TripController::class, 'destroy']);

$router->get("$prefix/dashboard/stats", [DashboardController::class, 'stats']);

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
