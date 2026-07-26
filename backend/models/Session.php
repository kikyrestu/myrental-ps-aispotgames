<?php

class Session
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(?string $status = null): array
    {
        $sql = 'SELECT s.*, u.name AS unit_name, u.console_type, p.name AS package_name
                FROM rental_sessions s
                JOIN units u ON u.id = s.unit_id
                LEFT JOIN packages p ON p.id = s.package_id';
        $params = [];

        if ($status) {
            $sql .= ' WHERE s.status = ?';
            $params[] = $status;
        }

        $sql .= ' ORDER BY s.start_time DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT s.*, u.name AS unit_name FROM rental_sessions s
             JOIN units u ON u.id = s.unit_id WHERE s.id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        $session = $stmt->fetch();
        return $session ?: null;
    }

    /**
     * Mulai sesi baru. Unit harus dalam status 'kosong'.
     * durationMinutes wajib ada — dari package ATAU custom duration.
     */
    public function start(array $data, int $userId): array
    {
        $this->db->beginTransaction();
        try {
            // lock row unit biar gak ke-double-booking kalau dua kasir input bareng
            $stmt = $this->db->prepare('SELECT status FROM units WHERE id = ? FOR UPDATE');
            $stmt->execute([$data['unit_id']]);
            $unit = $stmt->fetch();

            if (!$unit) {
                throw new RuntimeException('Unit tidak ditemukan');
            }
            if ($unit['status'] !== 'kosong') {
                throw new RuntimeException('Unit sedang tidak kosong');
            }

            $durationMinutes = (int) $data['duration_minutes'];
            $startTime = date('Y-m-d H:i:s');
            $plannedEnd = date('Y-m-d H:i:s', strtotime("+{$durationMinutes} minutes"));

            $stmt = $this->db->prepare(
                'INSERT INTO rental_sessions 
                    (unit_id, package_id, member_id, promo_id, customer_name, session_type, duration_minutes, deposit_time_used, start_time, planned_end_time, status, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "ongoing", ?)'
            );
            $stmt->execute([
                $data['unit_id'],
                $data['package_id'] ?? null,
                $data['member_id'] ?? null,
                $data['promo_id'] ?? null,
                $data['customer_name'] ?? null,
                $data['session_type'] ?? 'walkin',
                $durationMinutes,
                $data['deposit_time_used'] ?? 0,
                $startTime,
                $plannedEnd,
                $userId,
            ]);
            $sessionId = (int) $this->db->lastInsertId();

            $stmt = $this->db->prepare('UPDATE units SET status = "dipakai" WHERE id = ?');
            $stmt->execute([$data['unit_id']]);

            $this->db->commit();
            return $this->find($sessionId);
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function extend(int $id, int $extraMinutes): array
    {
        $session = $this->find($id);
        if (!$session) {
            throw new RuntimeException('Sesi tidak ditemukan');
        }
        if ($session['status'] !== 'ongoing') {
            throw new RuntimeException('Sesi sudah tidak berjalan');
        }

        $newExtra = (int)$session['extra_minutes'] + $extraMinutes;
        $totalDuration = (int)$session['duration_minutes'] + $newExtra;
        if ($totalDuration < 0) {
            throw new RuntimeException('Total durasi waktu bermain tidak boleh kurang dari 0 menit.');
        }

        $newPlannedEnd = date('Y-m-d H:i:s', strtotime($session['planned_end_time']) + ($extraMinutes * 60));

        $stmt = $this->db->prepare(
            'UPDATE rental_sessions
             SET planned_end_time = ?, extra_minutes = extra_minutes + ?
             WHERE id = ?'
        );
        $stmt->execute([$newPlannedEnd, $extraMinutes, $id]);

        return $this->find($id);
    }

    public function updateMember(int $id, int $memberId): void
    {
        $stmt = $this->db->prepare('UPDATE rental_sessions SET member_id = ? WHERE id = ?');
        $stmt->execute([$memberId, $id]);
    }

    /**
     * Selesaikan sesi, hitung total biaya, bebasin unit.
     * totalAmount dihitung di controller/TransactionController supaya bisa nyambung promo (fase 3).
     */
    public function complete(int $id, float $totalAmount, ?int $promoId = null, ?int $actualDuration = null): array
    {
        $session = $this->find($id);
        if (!$session) {
            throw new RuntimeException('Sesi tidak ditemukan');
        }
        if ($session['status'] !== 'ongoing') {
            throw new RuntimeException('Sesi sudah tidak berjalan');
        }

        $endTime = date('Y-m-d H:i:s');
        $durationToSave = $actualDuration !== null ? $actualDuration : (int)$session['duration_minutes'];
        if ($durationToSave === 0) {
            $durationToSave = max(1, (int) round((strtotime($endTime) - strtotime($session['start_time'])) / 60));
        }

        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                'UPDATE rental_sessions SET status = "completed", end_time = ?, duration_minutes = ?, total_amount = ?, promo_id = ? WHERE id = ?'
            );
            $stmt->execute([$endTime, $durationToSave, $totalAmount, $promoId, $id]);

            $stmt = $this->db->prepare('UPDATE units SET status = "kosong" WHERE id = ?');
            $stmt->execute([$session['unit_id']]);

            $this->db->commit();
            return $this->find($id);
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function cancel(int $id): array
    {
        $session = $this->find($id);
        if (!$session) {
            throw new RuntimeException('Sesi tidak ditemukan');
        }
        if ($session['status'] !== 'ongoing') {
            throw new RuntimeException('Sesi sudah tidak berjalan');
        }

        $endTime = date('Y-m-d H:i:s');
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare('UPDATE rental_sessions SET status = "cancelled", end_time = ? WHERE id = ?');
            $stmt->execute([$endTime, $id]);

            $stmt = $this->db->prepare('UPDATE units SET status = "kosong" WHERE id = ?');
            $stmt->execute([$session['unit_id']]);

            $this->db->commit();
            return $this->find($id);
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
