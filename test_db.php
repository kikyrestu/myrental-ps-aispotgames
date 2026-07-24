<?php
require 'backend/config/env.php';
require 'backend/core/Database.php';
$db = Database::getConnection();
$income = $db->query('SELECT SUM(amount) AS total FROM transactions WHERE type=\'income\'')->fetch()['total'] ?? 0;
$expenses = $db->query('SELECT SUM(amount) AS total FROM expenses')->fetch()['total'] ?? 0;
$fixed = $db->query('SELECT SUM(amount) AS total FROM fixed_expenses')->fetch()['total'] ?? 0;
echo "Income: " . $income . "\n";
echo "Expenses (Laci): " . $expenses . "\n";
echo "Fixed Expenses: " . $fixed . "\n";
echo "Net Revenue: " . ($income - $expenses - $fixed) . "\n";
