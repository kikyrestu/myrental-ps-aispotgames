<?php

class Expense
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function allByShift(int $shiftId): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM expenses WHERE shift_id = ? ORDER BY created_at DESC'
        );
        $stmt->execute([$shiftId]);
        return $stmt->fetchAll();
    }
    
    public function all(): array
    {
        $stmt = $this->db->query(
            'SELECT e.*, u.full_name as kasir_name FROM expenses e JOIN users u ON e.kasir_id = u.id ORDER BY e.created_at DESC'
        );
        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO expenses (shift_id, kasir_id, category, description, amount) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['shift_id'] ?? null,
            $data['kasir_id'],
            $data['category'],
            $data['description'] ?? null,
            $data['amount'],
        ]);
        return (int) $this->db->lastInsertId();
    }
}
