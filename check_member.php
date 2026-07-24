<?php
require 'backend/config/env.php';
require 'backend/core/Database.php';
$db = Database::getConnection();
foreach($db->query('DESCRIBE members') as $col) {
    echo $col['Field'] . ' - Null: ' . $col['Null'] . "\n";
}
