<?php

class ConsoleType
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query('SELECT * FROM console_types ORDER BY id ASC');
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM console_types WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $data = $stmt->fetch();
        return $data ?: null;
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare('INSERT INTO console_types (name, description) VALUES (:name, :description)');
        $stmt->execute([
            'name'        => strtoupper(trim($data['name'])),
            'description' => $data['description'] ?? null
        ]);
        $id = (int)$this->db->lastInsertId();
        return $this->find($id);
    }

    public function update(int $id, array $data): array
    {
        $stmt = $this->db->prepare('UPDATE console_types SET name = :name, description = :description WHERE id = :id');
        $stmt->execute([
            'name'        => strtoupper(trim($data['name'])),
            'description' => $data['description'] ?? null,
            'id'          => $id
        ]);
        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM console_types WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
