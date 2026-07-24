<?php
require_once __DIR__ . '/config/env.php';
$dbConfig = require __DIR__ . '/config/database.php';

try {
    $dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['name']};charset={$dbConfig['charset']}";
    $db = new PDO($dsn, $dbConfig['user'], $dbConfig['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $db->exec("
        ALTER TABLE shifts 
        ADD COLUMN opening_digital_balance DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER opening_balance,
        ADD COLUMN closing_digital_balance DECIMAL(12,2) NULL AFTER closing_balance,
        ADD COLUMN expected_digital_balance DECIMAL(12,2) NULL AFTER expected_balance,
        ADD COLUMN digital_difference DECIMAL(12,2) NULL AFTER difference;
    ");

    echo "Migration shifts success!\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
