<?php
require 'backend/config/env.php';
require 'backend/core/Database.php';

$db = Database::getConnection();

$db->exec('CREATE TABLE IF NOT EXISTS `settings` (
    `setting_key` VARCHAR(50) NOT NULL PRIMARY KEY,
    `setting_value` TEXT,
    `description` VARCHAR(255),
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');

$stmt = $db->prepare('INSERT IGNORE INTO settings (setting_key, setting_value, description) VALUES (?, ?, ?)');
$stmt->execute(['shift_start_time', '09:00', 'Jam peringatan buka kasir (HH:MM)']);
$stmt->execute(['shift_end_time', '23:00', 'Jam auto-close kasir (HH:MM)']);

echo "Settings table created and seeded.\n";
