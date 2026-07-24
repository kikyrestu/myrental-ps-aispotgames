<?php
require 'config/env.php';
$c=require 'config/database.php';
$db=new PDO('mysql:host='.$c['host'].';dbname='.$c['name'], $c['user'], $c['pass']);
$stmt=$db->query('SHOW TABLES');
print_r($stmt->fetchAll(PDO::FETCH_COLUMN));
