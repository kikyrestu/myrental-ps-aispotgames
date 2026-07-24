<?php

class ProductCategory
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query("SELECT * FROM product_categories ORDER BY name ASC");
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM product_categories WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $cat = $stmt->fetch();
        return $cat ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare("INSERT INTO product_categories (name) VALUES (?)");
        $stmt->execute([$data['name']]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare("UPDATE product_categories SET name = ? WHERE id = ?");
        return $stmt->execute([$data['name'], $id]);
    }

    public function delete(int $id): bool
    {
        // First check if category is being used by any product
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM products WHERE category_id = ?");
        $stmt->execute([$id]);
        if ($stmt->fetchColumn() > 0) {
            throw new RuntimeException("Kategori tidak bisa dihapus karena masih digunakan oleh produk.");
        }

        $stmt = $this->db->prepare("DELETE FROM product_categories WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
