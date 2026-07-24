<?php
require 'backend/config/env.php';
require 'backend/core/Database.php';
$db = Database::getConnection();
echo "--- Transactions ---\n";
print_r($db->query('SELECT * FROM transactions')->fetchAll());
echo "--- Expenses (Laci) ---\n";
print_r($db->query('SELECT * FROM expenses')->fetchAll());
echo "--- Fixed Expenses ---\n";
print_r($db->query('SELECT * FROM fixed_expenses')->fetchAll());
