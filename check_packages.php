<?php
require 'backend/config/env.php';
require 'backend/core/Database.php';
$db = Database::getConnection();
foreach($db->query('SELECT * FROM packages')->fetchAll() as $p) {
    print_r($p);
}
