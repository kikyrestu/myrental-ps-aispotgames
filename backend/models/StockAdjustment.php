<?php

class StockAdjustment
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query("
            SELECT s.*, p.name AS product_name, pc.name AS category_name, u.full_name AS kasir_name
            FROM stock_adjustments s
            JOIN products p ON s.product_id = p.id
            LEFT JOIN product_categories pc ON p.category_id = pc.id
            JOIN users u ON s.created_by = u.id
            ORDER BY s.created_at DESC
        ");
        return $stmt->fetchAll();
    }

    public function create(array $data, int $userId): int
    {
        try {
            $this->db->beginTransaction();

            // Insert stock adjustment
            $stmt = $this->db->prepare("
                INSERT INTO stock_adjustments (product_id, type, qty, note, created_by)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['product_id'],
                $data['type'],
                $data['qty'],
                $data['note'] ?? null,
                $userId
            ]);
            $id = (int) $this->db->lastInsertId();

            // Update product stock
            $qty_change = $data['type'] === 'in' ? $data['qty'] : -$data['qty'];
            $productModel = new Product();
            $productModel->updateStock($data['product_id'], $qty_change);

            $this->db->commit();
            return $id;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
