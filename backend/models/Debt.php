<?php

class Debt
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query(
            "SELECT d.*, u.full_name as kasir_name 
             FROM debts d 
             LEFT JOIN users u ON d.kasir_id = u.id 
             ORDER BY d.created_at DESC"
        );
        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO debts (type, person_name, amount, description, due_date, status, kasir_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['type'],
            $data['person_name'],
            $data['amount'],
            $data['description'] ?? null,
            $data['due_date'] ?? null,
            $data['status'] ?? 'pending',
            $data['kasir_id'] ?? null
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->db->prepare('UPDATE debts SET status = ? WHERE id = ?');
        return $stmt->execute([$status, $id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM debts WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
