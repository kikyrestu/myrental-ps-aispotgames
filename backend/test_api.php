<?php
$url = 'http://localhost:8000/api/reports/dashboard';
$options = [
    'http' => [
        'header' => 'Cookie: ' . (isset($_SERVER['HTTP_COOKIE']) ? $_SERVER['HTTP_COOKIE'] : '')
    ]
];
$context = stream_context_create($options);
echo file_get_contents($url, false, $context);
