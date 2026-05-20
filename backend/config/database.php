<?php

return [
    'driver'   => getenv('DB_DRIVER') ?: 'pgsql',
    'host'     => getenv('DB_HOST') ?: 'localhost',
    'port'     => getenv('DB_PORT') ?: '5432',
    'database' => getenv('DB_NAME') ?: 'transterminal',
    'username' => getenv('DB_USER') ?: 'postgres',
    'password' => getenv('DB_PASS') ?: '',
    'charset'  => 'utf8',
    'sslmode'  => getenv('DB_SSLMODE') ?: 'require',
];
