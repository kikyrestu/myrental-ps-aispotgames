<?php

class Product
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query("
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN product_categories c ON p.category_id = c.id 
            WHERE p.is_active = 1 
            ORDER BY c.name, p.name
        ");
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN product_categories c ON p.category_id = c.id 
            WHERE p.id = ? LIMIT 1
        ");
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        return $product ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO products (name, category_id, cost_price, price, stock) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['name'],
            empty($data['category_id']) ? null : (int)$data['category_id'],
            empty($data['cost_price']) ? 0 : (float)$data['cost_price'],
            empty($data['price']) ? 0 : (float)$data['price'],
            empty($data['stock']) ? 0 : (int)$data['stock']
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare("
            UPDATE products 
            SET name = ?, category_id = ?, cost_price = ?, price = ?, stock = ? 
            WHERE id = ?
        ");
        return $stmt->execute([
            $data['name'],
            empty($data['category_id']) ? null : (int)$data['category_id'],
            empty($data['cost_price']) ? 0 : (float)$data['cost_price'],
            empty($data['price']) ? 0 : (float)$data['price'],
            empty($data['stock']) ? 0 : (int)$data['stock'],
            $id
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("UPDATE products SET is_active = 0 WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function updateStock(int $id, int $qty_change): bool
    {
        if ($qty_change < 0) {
            // Guard: pastikan stok cukup sebelum dikurangi
            $stmt = $this->db->prepare("UPDATE products SET stock = stock + ? WHERE id = ? AND stock >= ?");
            $stmt->execute([$qty_change, $id, abs($qty_change)]);
            if ($stmt->rowCount() === 0) {
                throw new RuntimeException("Stok tidak cukup untuk produk ID {$id}");
            }
            return true;
        }
        $stmt = $this->db->prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
        return $stmt->execute([$qty_change, $id]);
    }
}
