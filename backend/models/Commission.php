<?php

class Commission
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Get commission report per owner
     */
    public function getReportPerOwner(): array
    {
        $sql = "
            SELECT 
                o.id AS owner_id,
                o.name AS owner_name,
                o.bank_account,
                COUNT(c.id) AS total_sessions,
                SUM(CASE WHEN c.status = 'unpaid' THEN c.amount ELSE 0 END) AS unpaid_amount,
                SUM(CASE WHEN c.status = 'paid' THEN c.amount ELSE 0 END) AS paid_amount,
                SUM(c.amount) AS total_amount
            FROM owners o
            LEFT JOIN commissions c ON c.owner_id = o.id
            GROUP BY o.id
            ORDER BY o.name ASC
        ";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Get detailed commissions for a specific owner
     */
    public function getDetailsByOwner(int $ownerId, string $status = 'all'): array
    {
        $sql = "
            SELECT 
                c.*, 
                u.name AS unit_name,
                s.start_time,
                s.end_time,
                (s.duration_minutes + s.extra_minutes) AS duration_minutes
            FROM commissions c
            JOIN units u ON u.id = c.unit_id
            JOIN rental_sessions s ON s.id = c.session_id
            WHERE c.owner_id = ?
        ";
        
        $params = [$ownerId];
        
        if ($status !== 'all') {
            $sql .= " AND c.status = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY c.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Pay all unpaid commissions for a specific owner
     */
    public function payCommissions(int $ownerId): int
    {
        $stmt = $this->db->prepare("
            UPDATE commissions 
            SET status = 'paid', paid_at = NOW() 
            WHERE owner_id = ? AND status = 'unpaid'
        ");
        $stmt->execute([$ownerId]);
        return $stmt->rowCount();
    }

    /**
     * Create a new commission record
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO commissions (session_id, unit_id, owner_id, amount)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['session_id'],
            $data['unit_id'],
            $data['owner_id'],
            $data['amount']
        ]);
        return (int) $this->db->lastInsertId();
    }
}
