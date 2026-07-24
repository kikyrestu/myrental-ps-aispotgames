<?php

class ShiftController
{
    public function current(Request $request): void
    {
        $kasirId = (int) $_SESSION['user_id'];
        $model = new Shift();
        $shift = $model->current($kasirId);
        
        if ($shift) {
            // Check Auto-Close Settings
            require_once __DIR__ . '/../models/Settings.php';
            $settingsModel = new Settings();
            $endTimeStr = $settingsModel->get('shift_end_time');
            
            if ($endTimeStr) {
                $currentTime = date('H:i');
                // if it passed the end time today, we should close it.
                // Note: time logic must be careful with overnight shifts.
                // Let's assume simple daily close for now: if current time >= end_time OR if shift opened_at was yesterday
                
                $openedAtDate = date('Y-m-d', strtotime($shift['opened_at']));
                $todayDate = date('Y-m-d');
                $shouldClose = false;
                $closedAtTimestamp = null;
                
                if ($openedAtDate < $todayDate) {
                    // It's from a previous day. It should definitely be closed.
                    $shouldClose = true;
                    $closedAtTimestamp = $openedAtDate . ' ' . $endTimeStr . ':00';
                } else if ($currentTime >= $endTimeStr) {
                    // It's today, but past the end time
                    $shouldClose = true;
                    $closedAtTimestamp = $todayDate . ' ' . $endTimeStr . ':00';
                }
                
                if ($shouldClose) {
                    $shiftId = (int) $shift['id'];
                    $openingBalance = (float) $shift['opening_balance'];
                    $openingDigitalBalance = (float) $shift['opening_digital_balance'];
                    
                    $cashTransactions = $model->getShiftTransactionsTotal($shiftId);
                    $expenses = $model->getShiftExpensesTotal($shiftId);
                    $expectedBalance = $openingBalance + $cashTransactions - $expenses;
                    
                    $digitalTransactions = $model->getShiftDigitalTransactionsTotal($shiftId);
                    $expectedDigitalBalance = $openingDigitalBalance + $digitalTransactions;

                    // Close it automatically
                    $model->close($shiftId, $expectedBalance, $expectedBalance, 0, $expectedDigitalBalance, $expectedDigitalBalance, 0, $closedAtTimestamp);
                    
                    ResponseHelper::success(null, 'Tidak ada shift aktif (Otomatis ditutup)');
                    return;
                }
            }

            ResponseHelper::success($shift);
        } else {
            ResponseHelper::success(null, 'Tidak ada shift aktif');
        }
    }

    public function open(Request $request): void
    {
        $v = new Validator($request->all(), [
            'opening_balance' => 'required|numeric',
            'opening_digital_balance' => 'numeric',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $kasirId = (int) $_SESSION['user_id'];
        $model = new Shift();
        
        if ($model->current($kasirId)) {
            ResponseHelper::error('Anda masih memiliki shift yang aktif', 400);
            return;
        }
        
        $openingBalance = (float) $request->input('opening_balance');
        $openingDigitalBalance = (float) $request->input('opening_digital_balance', 0);
        $id = $model->open($kasirId, $openingBalance, $openingDigitalBalance);
        
        ResponseHelper::success([
            'id' => $id, 
            'opening_balance' => $openingBalance,
            'opening_digital_balance' => $openingDigitalBalance
        ], 'Shift berhasil dibuka', 201);
    }

    public function close(Request $request): void
    {
        $v = new Validator($request->all(), [
            'closing_balance' => 'required|numeric',
            'closing_digital_balance' => 'required|numeric',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $kasirId = (int) $_SESSION['user_id'];
        $model = new Shift();
        $shift = $model->current($kasirId);
        
        if (!$shift) {
            ResponseHelper::error('Tidak ada shift aktif untuk ditutup', 400);
            return;
        }

        $shiftId = (int) $shift['id'];
        $openingBalance = (float) $shift['opening_balance'];
        $closingBalance = (float) $request->input('closing_balance');
        
        $openingDigitalBalance = (float) $shift['opening_digital_balance'];
        $closingDigitalBalance = (float) $request->input('closing_digital_balance');
        
        // Calculate expected balance
        $cashTransactions = $model->getShiftTransactionsTotal($shiftId);
        $expenses = $model->getShiftExpensesTotal($shiftId);
        $expectedBalance = $openingBalance + $cashTransactions - $expenses;
        $difference = $closingBalance - $expectedBalance;

        // Calculate expected digital balance
        $digitalTransactions = $model->getShiftDigitalTransactionsTotal($shiftId);
        $expectedDigitalBalance = $openingDigitalBalance + $digitalTransactions;
        $digitalDifference = $closingDigitalBalance - $expectedDigitalBalance;
        
        $model->close($shiftId, $closingBalance, $expectedBalance, $difference, $closingDigitalBalance, $expectedDigitalBalance, $digitalDifference);
        
        ResponseHelper::success([
            'expected_balance' => $expectedBalance,
            'closing_balance' => $closingBalance,
            'difference' => $difference,
            'expected_digital_balance' => $expectedDigitalBalance,
            'closing_digital_balance' => $closingDigitalBalance,
            'digital_difference' => $digitalDifference
        ], 'Shift berhasil ditutup');
    }

    public function forceClose(Request $request): void
    {
        if ($_SESSION['user_role'] !== 'admin') {
            ResponseHelper::error('Unauthorized', 403);
            return;
        }

        $v = new Validator($request->all(), [
            'shift_id' => 'required|numeric',
            'closed_at' => 'required'
        ]);

        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $shiftId = (int) $request->input('shift_id');
        $closedAt = $request->input('closed_at');

        $model = new Shift();
        // Since it's a force close, we will just calculate expected balance and assume closing balance = expected balance
        $stmt = Database::getConnection()->prepare("SELECT * FROM shifts WHERE id = ?");
        $stmt->execute([$shiftId]);
        $shift = $stmt->fetch();

        if (!$shift || $shift['status'] === 'closed') {
            ResponseHelper::error('Shift tidak valid atau sudah ditutup', 400);
            return;
        }

        $openingBalance = (float) $shift['opening_balance'];
        $openingDigitalBalance = (float) $shift['opening_digital_balance'];

        $cashTransactions = $model->getShiftTransactionsTotal($shiftId);
        $expenses = $model->getShiftExpensesTotal($shiftId);
        $expectedBalance = $openingBalance + $cashTransactions - $expenses;
        
        $digitalTransactions = $model->getShiftDigitalTransactionsTotal($shiftId);
        $expectedDigitalBalance = $openingDigitalBalance + $digitalTransactions;

        $model->close($shiftId, $expectedBalance, $expectedBalance, 0, $expectedDigitalBalance, $expectedDigitalBalance, 0, $closedAt);

        ResponseHelper::success(null, 'Shift berhasil ditutup paksa');
    }
}
