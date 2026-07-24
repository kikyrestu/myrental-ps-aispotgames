<?php
require_once __DIR__ . '/config/env.php';

spl_autoload_register(function (string $class) {
    $dirs = ['core', 'middleware', 'controllers', 'models', 'helpers'];
    foreach ($dirs as $dir) {
        $file = __DIR__ . "/{$dir}/{$class}.php";
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

$db = Database::getConnection();

$stmtActiveShift = $db->query("SELECT * FROM shifts WHERE status = 'open' ORDER BY opened_at DESC LIMIT 1");
$activeShift = $stmtActiveShift->fetch();

$currentExpectedCash = 0;
$currentExpectedDigital = 0;

if ($activeShift) {
    $shiftModel = new Shift();
    $shiftId = (int)$activeShift['id'];
    
    $openingCash = (float)$activeShift['opening_balance'];
    $openingDigital = (float)$activeShift['opening_digital_balance'];
    
    $cashTransactions = $shiftModel->getShiftTransactionsTotal($shiftId);
    $expenses = $shiftModel->getShiftExpensesTotal($shiftId);
    $digitalTransactions = $shiftModel->getShiftDigitalTransactionsTotal($shiftId);
    
    $currentExpectedCash = $openingCash + $cashTransactions - $expenses;
    $currentExpectedDigital = $openingDigital + $digitalTransactions;
}

echo json_encode([
    'current_expected_cash' => $currentExpectedCash,
    'current_expected_digital' => $currentExpectedDigital,
    'has_active_shift' => (bool)$activeShift
]);
