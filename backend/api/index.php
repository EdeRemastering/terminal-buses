<?php

// Vercel pasa la URL original en PATH_INFO
if (!empty($_SERVER['PATH_INFO'])) {
    $_SERVER['REQUEST_URI'] = $_SERVER['PATH_INFO'];
}

require_once __DIR__ . '/../public/index.php';
