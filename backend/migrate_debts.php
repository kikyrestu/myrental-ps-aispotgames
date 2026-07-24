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
        CREATE TABLE IF NOT EXISTS debts (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            type ENUM('utang', 'piutang') NOT NULL,
            person_name VARCHAR(255) NOT NULL,
            amount DECIMAL(12, 2) NOT NULL,
            description TEXT,
            due_date DATE NULL,
            status ENUM('pending', 'paid') NOT NULL DEFAULT 'pending',
            kasir_id INT UNSIGNED NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_debt_kasir FOREIGN KEY (kasir_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    echo "Migration debts success!\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
