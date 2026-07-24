<?php
require 'config/env.php';
$c=require 'config/database.php';
$db=new PDO('mysql:host='.$c['host'].';dbname='.$c['name'], $c['user'], $c['pass']);
$stmt=$db->query('SELECT * FROM shifts ORDER BY id DESC LIMIT 2');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
