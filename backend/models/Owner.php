<?php

class Owner
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query('
            SELECT o.*, u.username 
            FROM owners o 
            LEFT JOIN users u ON u.owner_id = o.id AND u.role = "mitra" 
            ORDER BY o.name ASC
        ');
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('
            SELECT o.*, u.username 
            FROM owners o 
            LEFT JOIN users u ON u.owner_id = o.id AND u.role = "mitra"
            WHERE o.id = ?
        ');
        $stmt->execute([$id]);
        $owner = $stmt->fetch();
        return $owner ?: null;
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare(
            'INSERT INTO owners (name, phone, bank_account) VALUES (?, ?, ?)'
        );
        $stmt->execute([
            $data['name'],
            $data['phone'] ?? null,
            $data['bank_account'] ?? null,
        ]);
        $id = (int) $this->db->lastInsertId();
        
        $this->syncUser($id, $data['name'], $data['username'] ?? null, $data['password'] ?? null);
        
        return $this->find($id);
    }

    public function update(int $id, array $data): array
    {
        $owner = $this->find($id);
        if (!$owner) {
            throw new RuntimeException('Investor tidak ditemukan');
        }

        $stmt = $this->db->prepare(
            'UPDATE owners SET name = ?, phone = ?, bank_account = ? WHERE id = ?'
        );
        $stmt->execute([
            $data['name'],
            $data['phone'] ?? null,
            $data['bank_account'] ?? null,
            $id
        ]);
        
        $this->syncUser($id, $data['name'], $data['username'] ?? null, $data['password'] ?? null);
        
        return $this->find($id);
    }

    private function syncUser(int $ownerId, string $ownerName, ?string $username, ?string $password): void
    {
        if (empty($username)) return;

        // Cek apakah user mitra dengan owner_id ini sudah ada
        $stmt = $this->db->prepare('SELECT id FROM users WHERE owner_id = ? AND role = "mitra"');
        $stmt->execute([$ownerId]);
        $user = $stmt->fetch();

        if ($user) {
            // Update username, dan update password jika diisi
            if (!empty($password)) {
                $stmt = $this->db->prepare('UPDATE users SET username = ?, password_hash = ? WHERE id = ?');
                $stmt->execute([$username, password_hash($password, PASSWORD_BCRYPT), $user['id']]);
            } else {
                $stmt = $this->db->prepare('UPDATE users SET username = ? WHERE id = ?');
                $stmt->execute([$username, $user['id']]);
            }
        } else {
            // Cek apakah username sudah ada yang pake
            $stmt = $this->db->prepare('SELECT id FROM users WHERE username = ?');
            $stmt->execute([$username]);
            if ($stmt->fetch()) {
                throw new RuntimeException('Username sudah digunakan oleh akun lain');
            }

            // Buat user baru
            if (empty($password)) {
                throw new RuntimeException('Password wajib diisi untuk membuat akun login baru');
            }
            $stmt = $this->db->prepare(
                'INSERT INTO users (username, password_hash, full_name, role, owner_id) VALUES (?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $username,
                password_hash($password, PASSWORD_BCRYPT),
                $ownerName,
                'mitra',
                $ownerId
            ]);
        }
    }

    public function delete(int $id): void
    {
        $owner = $this->find($id);
        if (!$owner) {
            throw new RuntimeException('Investor tidak ditemukan');
        }
        
        // Hapus akun login mitra terkait
        $stmt = $this->db->prepare('DELETE FROM users WHERE owner_id = ? AND role = "mitra"');
        $stmt->execute([$id]);

        $stmt = $this->db->prepare('DELETE FROM owners WHERE id = ?');
        $stmt->execute([$id]);
    }
}
