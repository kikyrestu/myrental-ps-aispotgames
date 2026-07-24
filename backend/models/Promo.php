<?php

class Promo
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query(
            'SELECT * FROM promos WHERE is_active = 1 ORDER BY created_at DESC'
        );
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM promos WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $promo = $stmt->fetch();
        return $promo ?: null;
    }

    public function findByCode(string $code): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM promos WHERE code = ? AND is_active = 1 LIMIT 1');
        $stmt->execute([$code]);
        $promo = $stmt->fetch();
        return $promo ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO promos (code, description, type, value, min_amount, valid_from, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['code'],
            $data['description'] ?? null,
            $data['type'], // 'percentage' or 'fixed'
            $data['value'],
            $data['min_amount'] ?? 0,
            $data['valid_from'] ?? null,
            $data['valid_until'] ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE promos SET code = ?, description = ?, type = ?, value = ?, min_amount = ?, valid_from = ?, valid_until = ? WHERE id = ?'
        );
        return $stmt->execute([
            $data['code'],
            $data['description'] ?? null,
            $data['type'],
            $data['value'],
            $data['min_amount'] ?? 0,
            $data['valid_from'] ?? null,
            $data['valid_until'] ?? null,
            $id,
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('UPDATE promos SET is_active = 0 WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
