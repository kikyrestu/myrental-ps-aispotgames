<?php

class SessionOrder
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getBySession(int $sessionId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM session_orders WHERE session_id = ? ORDER BY created_at ASC");
        $stmt->execute([$sessionId]);
        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                INSERT INTO session_orders (session_id, product_id, item_name, qty, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $subtotal = $data['qty'] * $data['unit_price'];
            $stmt->execute([
                $data['session_id'],
                $data['product_id'] ?? null,
                $data['item_name'],
                $data['qty'],
                $data['unit_price'],
                $subtotal
            ]);
            $id = (int) $this->db->lastInsertId();

            // Deduct stock if product_id is set
            if (!empty($data['product_id'])) {
                $productModel = new Product();
                $productModel->updateStock((int) $data['product_id'], -(int) $data['qty']);
                
                // Record stock movement (out)
                $stmtStock = $this->db->prepare("
                    INSERT INTO stock_adjustments (product_id, type, qty, note, created_by)
                    VALUES (?, 'out', ?, ?, ?)
                ");
                $stmtStock->execute([
                    $data['product_id'],
                    $data['qty'],
                    "Penjualan ke Sesi #" . $data['session_id'],
                    $_SESSION['user_id']
                ]);
            }

            $this->db->commit();
            return $id;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function calculateTotal(int $sessionId): float
    {
        $stmt = $this->db->prepare("SELECT SUM(subtotal) AS total FROM session_orders WHERE session_id = ?");
        $stmt->execute([$sessionId]);
        $row = $stmt->fetch();
        return (float) ($row['total'] ?? 0);
    }
}
