<?php

$secret = getenv('JWT_SECRET');
if (!$secret) {
    throw new \RuntimeException('JWT_SECRET environment variable is not set');
}

return [
    'secret'     => $secret,
    'algorithm'  => 'HS256',
    'expires_in' => 60 * 60 * 24,
    'issuer'     => 'transterminal-api',
];
