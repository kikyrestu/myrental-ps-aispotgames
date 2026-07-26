<?php

class MitraController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function dashboard(Request $request): void
    {
        // Ensure user is mitra
        if (empty($_SESSION['role']) || $_SESSION['role'] !== 'mitra') {
            ResponseHelper::error('Akses ditolak. Anda bukan mitra.', 403);
            return;
        }
        
        if (empty($_SESSION['owner_id'])) {
            ResponseHelper::error('Akses ditolak. Akun Anda belum terhubung dengan data Owner.', 403);
            return;
        }

        $ownerId = (int)$_SESSION['owner_id'];
        
        $startDate = $request->input('start_date', date('Y-m-01')); // default: this month
        $endDate = $request->input('end_date', date('Y-m-d'));

        // 1. Unpaid Commissions
        $stmt = $this->db->prepare('SELECT SUM(amount) as total FROM commissions WHERE owner_id = ? AND status = "unpaid"');
        $stmt->execute([$ownerId]);
        $unpaid = (float)$stmt->fetchColumn() ?: 0;

        // 2. Paid Commissions
        $stmt = $this->db->prepare('SELECT SUM(amount) as total FROM commissions WHERE owner_id = ? AND status = "paid" AND DATE(paid_at) BETWEEN ? AND ?');
        $stmt->execute([$ownerId, $startDate, $endDate]);
        $paid = (float)$stmt->fetchColumn() ?: 0;

        // 3. Estimated Income This Period (Both paid & unpaid from sessions within period)
        $stmt = $this->db->prepare('SELECT SUM(amount) as total FROM commissions WHERE owner_id = ? AND DATE(created_at) BETWEEN ? AND ?');
        $stmt->execute([$ownerId, $startDate, $endDate]);
        $estimated = (float)$stmt->fetchColumn() ?: 0;

        // 4. Unit Performance (Chart data)
        // Group by unit_id to see which unit generated the most commission
        $stmt = $this->db->prepare('
            SELECT u.name, SUM(c.amount) as total_commission, COUNT(c.id) as total_sessions
            FROM commissions c
            JOIN units u ON c.unit_id = u.id
            WHERE c.owner_id = ? AND DATE(c.created_at) BETWEEN ? AND ?
            GROUP BY u.id
            ORDER BY total_commission DESC
        ');
        $stmt->execute([$ownerId, $startDate, $endDate]);
        $unitPerformance = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 5. Recent Commissions (Recent sessions)
        $stmt = $this->db->prepare('
            SELECT c.id, c.amount, c.status, c.created_at, u.name as unit_name, (rs.duration_minutes + rs.extra_minutes) AS duration_minutes
            FROM commissions c
            JOIN units u ON c.unit_id = u.id
            JOIN rental_sessions rs ON c.session_id = rs.id
            WHERE c.owner_id = ?
            ORDER BY c.created_at DESC
            LIMIT 10
        ');
        $stmt->execute([$ownerId]);
        $recentCommissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // 6. Recent Payouts
        $stmt = $this->db->prepare('
            SELECT id, amount, paid_at
            FROM commissions 
            WHERE owner_id = ? AND status = "paid"
            ORDER BY paid_at DESC
            LIMIT 5
        ');
        $stmt->execute([$ownerId]);
        $recentPayouts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        ResponseHelper::success([
            'unpaid_commission' => $unpaid,
            'paid_commission' => $paid,
            'estimated_commission' => $estimated,
            'unit_performance' => $unitPerformance,
            'recent_commissions' => $recentCommissions,
            'recent_payouts' => $recentPayouts
        ]);
    }
}
