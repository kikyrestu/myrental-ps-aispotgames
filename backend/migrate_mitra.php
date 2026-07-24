<?php
require 'config/env.php';
$c = require 'config/database.php';
$db = new PDO('mysql:host='.$c['host'].';dbname='.$c['name'], $c['user'], $c['pass']);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $db->exec("ALTER TABLE users MODIFY COLUMN role ENUM('admin','kasir','mitra') NOT NULL DEFAULT 'kasir'");
    echo "Modified role column.\n";
} catch (Exception $e) {
    echo "Error modifying role: " . $e->getMessage() . "\n";
}

try {
    $db->exec("ALTER TABLE users ADD COLUMN owner_id INT UNSIGNED NULL AFTER role");
    $db->exec("ALTER TABLE users ADD CONSTRAINT fk_user_owner FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE SET NULL");
    echo "Added owner_id column and foreign key.\n";
} catch (Exception $e) {
    echo "Error adding owner_id: " . $e->getMessage() . "\n";
}
