<?php

/**
 * Catatan: model ini gak ada di daftar awal /models di plan (yang disebut cuma
 * Unit/Session/Transaction/Promo/Member/Shift/Expense/User), tapi tabel
 * `packages` dipakai buat nentuin harga & durasi pas mulai/selesai sesi,
 * jadi gue tambahin biar SessionController & TransactionController bisa
 * baca harga paket. Gampang dihapus/gabung kalau lo mau struktur persis plan.
 */
class Package
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query('SELECT * FROM packages WHERE is_active = 1 ORDER BY duration_minutes');
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM packages WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $pkg = $stmt->fetch();
        return $pkg ?: null;
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare('
            INSERT INTO packages (name, duration_minutes, price, console_type, is_active)
            VALUES (:name, :duration_minutes, :price, :console_type, :is_active)
        ');
        $stmt->execute([
            'name'             => $data['name'],
            'duration_minutes' => $data['duration_minutes'],
            'price'            => $data['price'] ?? 0,
            'console_type'     => $data['console_type'] ?? 'Semua',
            'is_active'        => $data['is_active'] ?? 1
        ]);
        $id = $this->db->lastInsertId();
        return $this->find((int) $id);
    }

    public function update(int $id, array $data): array
    {
        $stmt = $this->db->prepare('
            UPDATE packages 
            SET name = :name, duration_minutes = :duration_minutes, price = :price, console_type = :console_type, is_active = :is_active
            WHERE id = :id
        ');
        $stmt->execute([
            'name'             => $data['name'],
            'duration_minutes' => $data['duration_minutes'],
            'price'            => $data['price'] ?? 0,
            'console_type'     => $data['console_type'] ?? 'Semua',
            'is_active'        => $data['is_active'] ?? 1,
            'id'               => $id
        ]);
        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM packages WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
