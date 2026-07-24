<?php
require_once __DIR__ . '/config/env.php';
$dbConfig = require __DIR__ . '/config/database.php';

try {
    $dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['name']};charset={$dbConfig['charset']}";
    $db = new PDO($dsn, $dbConfig['user'], $dbConfig['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // 1. Create owners table
    $db->exec("
        CREATE TABLE IF NOT EXISTS owners (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NULL,
            bank_account VARCHAR(100) NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // 2. Modify units table (add owner_id, commission_rate)
    // Check if column exists first
    $stmt = $db->query("SHOW COLUMNS FROM units LIKE 'owner_id'");
    if ($stmt->rowCount() == 0) {
        $db->exec("
            ALTER TABLE units
            ADD COLUMN owner_id INT UNSIGNED NULL AFTER name,
            ADD COLUMN commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER owner_id,
            ADD CONSTRAINT fk_unit_owner FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE SET NULL;
        ");
    }

    // 3. Create commissions table
    $db->exec("
        CREATE TABLE IF NOT EXISTS commissions (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            session_id INT UNSIGNED NOT NULL,
            unit_id INT UNSIGNED NOT NULL,
            owner_id INT UNSIGNED NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            status ENUM('unpaid', 'paid') NOT NULL DEFAULT 'unpaid',
            paid_at DATETIME NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_commission_session FOREIGN KEY (session_id) REFERENCES rental_sessions(id) ON DELETE CASCADE,
            CONSTRAINT fk_commission_unit FOREIGN KEY (unit_id) REFERENCES units(id),
            CONSTRAINT fk_commission_owner FOREIGN KEY (owner_id) REFERENCES owners(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    echo "Migration success!\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
