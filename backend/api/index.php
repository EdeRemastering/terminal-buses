<?php

header('Content-Type: application/json');
echo json_encode([
    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'N/A',
    'path_info' => $_SERVER['PATH_INFO'] ?? 'N/A',
    'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'N/A',
    'method' => $_SERVER['REQUEST_METHOD'] ?? 'N/A',
]);

// require_once __DIR__ . '/../public/index.php'; // temporalmente comentado
