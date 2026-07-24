<?php

class Unit
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query(
            'SELECT u.*, o.name AS owner_name FROM units u LEFT JOIN owners o ON u.owner_id = o.id WHERE u.is_active = 1 ORDER BY u.name'
        );
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM units WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $unit = $stmt->fetch();
        return $unit ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO units (name, console_type, status, notes, owner_id, commission_rate) VALUES (?, ?, ?, ?, ?, ?)'
        );
        $ownerId = !empty($data['owner_id']) ? (int) $data['owner_id'] : null;
        $stmt->execute([
            $data['name'],
            $data['console_type'] ?? 'PS4',
            $data['status'] ?? 'kosong',
            $data['notes'] ?? null,
            $ownerId,
            $data['commission_rate'] ?? 0,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE units SET name = ?, console_type = ?, notes = ?, owner_id = ?, commission_rate = ? WHERE id = ?'
        );
        $ownerId = !empty($data['owner_id']) ? (int) $data['owner_id'] : null;
        return $stmt->execute([
            $data['name'],
            $data['console_type'] ?? 'PS4',
            $data['notes'] ?? null,
            $ownerId,
            $data['commission_rate'] ?? 0,
            $id,
        ]);
    }

    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->db->prepare('UPDATE units SET status = ? WHERE id = ?');
        return $stmt->execute([$status, $id]);
    }

    public function delete(int $id): bool
    {
        // soft delete — data unit tetap kepake buat histori sesi lama
        $stmt = $this->db->prepare('UPDATE units SET is_active = 0 WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
