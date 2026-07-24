<?php
require 'backend/config/env.php';
require 'backend/core/Database.php';

try {
    $db = Database::getConnection();
    $db->exec('ALTER TABLE rental_sessions ADD COLUMN deposit_time_used INT UNSIGNED NOT NULL DEFAULT 0 AFTER extra_minutes');
    echo "Column deposit_time_used added successfully.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Column already exists.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
