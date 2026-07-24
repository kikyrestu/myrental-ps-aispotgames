<?php

class FixedExpense
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query(
            "SELECT fe.*, u.full_name as user_name 
             FROM fixed_expenses fe 
             LEFT JOIN users u ON fe.user_id = u.id 
             ORDER BY fe.expense_date DESC, fe.created_at DESC"
        );
        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO fixed_expenses (expense_date, category, amount, description, user_id) 
             VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data["expense_date"],
            $data["category"],
            $data["amount"],
            $data["description"] ?? null,
            $data["user_id"] ?? null
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM fixed_expenses WHERE id = ?");
        return $stmt->execute([$id]);
    }
}

