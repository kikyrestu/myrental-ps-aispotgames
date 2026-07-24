<?php
require 'config/env.php';
$c=require 'config/database.php';
$db=new PDO('mysql:host='.$c['host'].';dbname='.$c['name'], $c['user'], $c['pass']);
$stmt=$db->query('SHOW CREATE TABLE units');
print_r($stmt->fetch(PDO::FETCH_ASSOC)['Create Table'] . "\n");
