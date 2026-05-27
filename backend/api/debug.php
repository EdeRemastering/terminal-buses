<?php
header('Content-Type: application/json');

$vendorExists = file_exists(__DIR__ . '/../vendor/autoload.php');

echo json_encode([
    'vendor_exists' => $vendorExists,
    'php_version' => phpversion(),
    'server' => [
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'N/A',
        'path_info' => $_SERVER['PATH_INFO'] ?? 'N/A',
        'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'N/A',
        'orig_path_info' => $_SERVER['ORIG_PATH_INFO'] ?? 'N/A',
        'redirect_url' => $_SERVER['REDIRECT_URL'] ?? 'N/A',
        'redirect_status' => $_SERVER['REDIRECT_STATUS'] ?? 'N/A',
    ],
]);
