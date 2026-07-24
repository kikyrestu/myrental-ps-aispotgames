<?php
require 'config/env.php';
$c=require 'config/database.php';
$db=new PDO('mysql:host='.$c['host'].';dbname='.$c['name'], $c['user'], $c['pass']);
$stmt=$db->query('SELECT id, kasir_id, opening_balance, opening_digital_balance, status FROM shifts ORDER BY id DESC LIMIT 5');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
