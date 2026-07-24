<?php
require 'backend/config/env.php';
require 'backend/core/Database.php';
$db = Database::getConnection();
$income = $db->query("SELECT SUM(amount) AS total FROM transactions")->fetch()['total'] ?? 0;
$expenses = $db->query("SELECT SUM(amount) AS total FROM expenses")->fetch()['total'] ?? 0;
$fixed = $db->query("SELECT SUM(amount) AS total FROM fixed_expenses")->fetch()['total'] ?? 0;
echo json_encode(['income' => $income, 'expenses' => $expenses, 'fixed' => $fixed]);
