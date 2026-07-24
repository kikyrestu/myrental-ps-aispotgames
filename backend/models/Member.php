<?php

class Member
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query(
            'SELECT * FROM members ORDER BY created_at DESC'
        );
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM members WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $member = $stmt->fetch();
        return $member ?: null;
    }

    public function findByPhone(string $phone): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM members WHERE phone = ? LIMIT 1');
        $stmt->execute([$phone]);
        $member = $stmt->fetch();
        return $member ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO members (name, phone, tier, points, time_balance) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['name'],
            !empty($data['phone']) ? $data['phone'] : null,
            $data['tier'] ?? 'reguler',
            $data['points'] ?? 0,
            $data['time_balance'] ?? 0,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE members SET name = ?, phone = ?, tier = ?, points = ?, time_balance = ? WHERE id = ?'
        );
        return $stmt->execute([
            $data['name'],
            !empty($data['phone']) ? $data['phone'] : null,
            $data['tier'] ?? 'reguler',
            $data['points'] ?? 0,
            $data['time_balance'] ?? 0,
            $id,
        ]);
    }

    public function addTime(int $id, int $minutes): bool
    {
        $stmt = $this->db->prepare('UPDATE members SET time_balance = time_balance + ? WHERE id = ?');
        return $stmt->execute([$minutes, $id]);
    }

    public function deductTime(int $id, int $minutes): bool
    {
        $stmt = $this->db->prepare('UPDATE members SET time_balance = GREATEST(time_balance - ?, 0) WHERE id = ?');
        return $stmt->execute([$minutes, $id]);
    }
}
