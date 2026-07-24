<?php

class ReportController
{
    public function daily(Request $request): void
    {
        // Simple aggregate report implementation
        $db = Database::getConnection();
        
        $date = $request->input('date') ?: date('Y-m-d');
        
        $stmt = $db->prepare("
            SELECT 
                SUM(amount) as total_income,
                SUM(discount_amount) as total_discount,
                COUNT(id) as total_transactions
            FROM transactions 
            WHERE DATE(created_at) = ?
        ");
        $stmt->execute([$date]);
        $income = $stmt->fetch();
        
        // BUG 13 FIX: Breakdown per payment method
        $stmtMethod = $db->prepare("
            SELECT 
                payment_method,
                SUM(amount) as total,
                COUNT(id) as count
            FROM transactions 
            WHERE DATE(created_at) = ?
            GROUP BY payment_method
        ");
        $stmtMethod->execute([$date]);
        $byMethod = $stmtMethod->fetchAll();
        
        $stmtExp = $db->prepare("
            SELECT SUM(amount) as total_expense
            FROM expenses
            WHERE DATE(created_at) = ?
            AND category NOT IN ('Piutang / Pinjaman', 'Setoran')
        ");
        $stmtExp->execute([$date]);
        $expense = $stmtExp->fetch();
        
        $net = (float)($income['total_income'] ?? 0) - (float)($expense['total_expense'] ?? 0);
        
        ResponseHelper::success([
            'date' => $date,
            'income' => (float)($income['total_income'] ?? 0),
            'discount' => (float)($income['total_discount'] ?? 0),
            'transactions_count' => (int)($income['total_transactions'] ?? 0),
            'by_payment_method' => $byMethod, // BUG 13 FIX: detail per metode bayar
            'expense' => (float)($expense['total_expense'] ?? 0),
            'net' => $net
        ]);
    }

    public function dashboard(Request $request): void
    {
        $db = Database::getConnection();
        
        $startDate = $request->input('start_date') ?: date('Y-m-d');
        $endDate = $request->input('end_date') ?: date('Y-m-d');
        
        // Ensure time boundaries
        $startDateTime = $startDate . ' 00:00:00';
        $endDateTime = $endDate . ' 23:59:59';

        // 1. Get Revenues by Category
        $stmtRev = $db->prepare("
            SELECT category, SUM(amount) as total 
            FROM transactions 
            WHERE created_at >= ? AND created_at <= ?
            GROUP BY category
        ");
        $stmtRev->execute([$startDateTime, $endDateTime]);
        $revenues = $stmtRev->fetchAll();

        $psRevenue = 0;
        $fbRevenue = 0;
        $otherRevenue = 0;

        foreach ($revenues as $rev) {
            if ($rev['category'] === 'sewa') $psRevenue = (float)$rev['total'];
            elseif ($rev['category'] === 'produk') $fbRevenue = (float)$rev['total'];
            else $otherRevenue += (float)$rev['total'];
        }

        $grossRevenue = $psRevenue + $fbRevenue + $otherRevenue;

        // 2. Get Expenses Total (excluding cash-flow only items like Kasbon)
        $stmtExp = $db->prepare("
            SELECT SUM(amount) as total_expense
            FROM expenses
            WHERE created_at >= ? AND created_at <= ?
            AND category NOT IN ('Piutang / Pinjaman', 'Setoran')
        ");
        $stmtExp->execute([$startDateTime, $endDateTime]);
        $exp = $stmtExp->fetch();
        $totalExpense = (float)($exp['total_expense'] ?? 0);

        // 3. Get Expense Details
        $stmtExpDetails = $db->prepare("
            SELECT id, description, amount, created_at 
            FROM expenses 
            WHERE created_at >= ? AND created_at <= ?
            ORDER BY created_at DESC
        ");
        $stmtExpDetails->execute([$startDateTime, $endDateTime]);
        $expenseDetails = $stmtExpDetails->fetchAll();

        // 4. Calculate Net
        $stmtFixedExp = $db->prepare("
            SELECT SUM(amount) as total_fixed
            FROM fixed_expenses
            WHERE expense_date >= ? AND expense_date <= ?
        ");
        $stmtFixedExp->execute([$startDate, $endDate]);
        $fixedExp = $stmtFixedExp->fetch();
        $totalFixedExpense = (float)($fixedExp['total_fixed'] ?? 0);

        $netRevenue = $grossRevenue - $totalExpense - $totalFixedExpense;

        // 5. Chart Data (Group by Date)
        $stmtChart = $db->prepare("
            SELECT DATE(created_at) as date, SUM(amount) as income 
            FROM transactions 
            WHERE created_at >= ? AND created_at <= ?
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
        ");
        $stmtChart->execute([$startDateTime, $endDateTime]);
        $chartDataRaw = $stmtChart->fetchAll();
        $chartData = array_map(function($row) {
            return [
                'name' => date('d M', strtotime($row['date'])),
                'income' => (float)$row['income']
            ];
        }, $chartDataRaw);

        // 6. Get Current Shift Balances if there's an active shift
        $stmtActiveShift = $db->query("SELECT * FROM shifts WHERE status = 'open' ORDER BY opened_at DESC LIMIT 1");
        $activeShift = $stmtActiveShift->fetch();
        
        $currentExpectedCash = 0;
        $currentExpectedDigital = 0;
        
        if ($activeShift) {
            require_once __DIR__ . '/../models/Shift.php';
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

        ResponseHelper::success([
            'start_date' => $startDate,
            'end_date' => $endDate,
            'ps_revenue' => $psRevenue,
            'fb_revenue' => $fbRevenue,
            'other_revenue' => $otherRevenue,
            'gross_revenue' => $grossRevenue,
            'total_expense' => $totalExpense,
            'total_fixed_expense' => $totalFixedExpense,
            'net_revenue' => $netRevenue,
            'expense_details' => $expenseDetails,
            'chart_data' => $chartData,
            'current_expected_cash' => $currentExpectedCash,
            'current_expected_digital' => $currentExpectedDigital,
            'has_active_shift' => (bool)$activeShift
        ]);
    }
}
