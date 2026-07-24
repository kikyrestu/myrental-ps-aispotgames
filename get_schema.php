<?php
require 'backend/config/env.php';
require 'backend/core/Database.php';
$db = Database::getConnection();
$tables = $db->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
foreach ($tables as $table) {
    echo "Table: $table\n";
    echo $db->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_ASSOC)['Create Table'] . "\n\n";
}
