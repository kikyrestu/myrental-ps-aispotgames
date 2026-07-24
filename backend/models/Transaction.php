<?php

class Transaction
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(?string $dateFrom = null, ?string $dateTo = null): array
    {
        $sql = 'SELECT t.*, u.full_name AS kasir_name, s.customer_name, s.unit_id
                FROM transactions t
                JOIN users u ON u.id = t.kasir_id
                LEFT JOIN rental_sessions s ON s.id = t.session_id
                WHERE 1=1';
        $params = [];

        if ($dateFrom) {
            $sql .= ' AND t.created_at >= ?';
            $params[] = $dateFrom . ' 00:00:00';
        }
        if ($dateTo) {
            $sql .= ' AND t.created_at <= ?';
            $params[] = $dateTo . ' 23:59:59';
        }

        $sql .= ' ORDER BY t.created_at DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function findWithDetails(int $id): ?array
    {
        // 1. Ambil data transaksi utama
        $stmt = $this->db->prepare('
            SELECT t.*, u.full_name AS kasir_name, s.customer_name, s.unit_id,
                   s.duration_minutes, s.extra_minutes, s.start_time, s.end_time
            FROM transactions t
            JOIN users u ON u.id = t.kasir_id
            LEFT JOIN rental_sessions s ON s.id = t.session_id
            WHERE t.id = ? LIMIT 1
        ');
        $stmt->execute([$id]);
        $trx = $stmt->fetch();

        if (!$trx) return null;

        // 2. Ambil rincian item (F&B atau lainnya)
        $itemStmt = $this->db->prepare('
            SELECT * FROM transaction_items WHERE transaction_id = ?
        ');
        $itemStmt->execute([$id]);
        $trx['items'] = $itemStmt->fetchAll();

        return $trx;
    }

    public function create(array $data, int $kasirId): int
    {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare(
                'INSERT INTO transactions
                    (session_id, shift_id, kasir_id, category, payment_method, amount, discount_amount, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $data['session_id'] ?? null,
                $data['shift_id'] ?? null,
                $kasirId,
                $data['category'] ?? 'sewa',
                $data['payment_method'] ?? 'cash',
                $data['amount'],
                $data['discount_amount'] ?? 0,
                $data['notes'] ?? null,
            ]);
            $trxId = (int) $this->db->lastInsertId();

            if (!empty($data['items']) && is_array($data['items'])) {
                $itemStmt = $this->db->prepare(
                    'INSERT INTO transaction_items (transaction_id, product_id, item_name, qty, unit_price, subtotal)
                     VALUES (?, ?, ?, ?, ?, ?)'
                );
                
                $productModel = new Product();
                $stockStmt = $this->db->prepare(
                    "INSERT INTO stock_adjustments (product_id, type, qty, note, created_by)
                     VALUES (?, 'out', ?, ?, ?)"
                );

                foreach ($data['items'] as $item) {
                    $subtotal = $item['qty'] * $item['unit_price'];
                    $itemStmt->execute([
                        $trxId,
                        $item['product_id'] ?? null,
                        $item['item_name'],
                        $item['qty'],
                        $item['unit_price'],
                        $subtotal
                    ]);

                    if (!empty($item['product_id']) && empty($item['is_stock_deducted'])) {
                        $productModel->updateStock((int) $item['product_id'], -(int) $item['qty']);
                        
                        $stockStmt->execute([
                            $item['product_id'],
                            $item['qty'],
                            "Penjualan Langsung (Kasir)",
                            $kasirId
                        ]);
                    }
                }
            }

            $this->db->commit();
            return $trxId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Hitung biaya sesi berdasarkan durasi aktual & tarif per jam unit,
     * dipakai waktu sesi di-complete kalau nggak pakai package tetap.
     */
    public function calculateSessionAmount(array $session, array $unit, ?array $package): float
    {
        // Fallback untuk sesi lama yang mungkin belum pake paket
        if (!$package) {
            return 0;
        }

        $pkgBasePrice = (float) $package['price'];
        $pkgDuration = (int) $package['duration_minutes'];

        if ($pkgDuration === 0) {
            // Paket "Main Bebas" (duration = 0). Price adalah tarif per jam.
            $totalMinutes = (int) $session['duration_minutes'] + (int) ($session['extra_minutes'] ?? 0);
            
            // Aturan Minimum Charge 1 Jam (60 menit)
            if ($totalMinutes < 60) {
                $totalMinutes = 60;
            }
            
            return round(($totalMinutes / 60) * $pkgBasePrice, 2);
        }

        // Paket fixed (misal 2 jam = Rp 20.000)
        $extraCharge = 0;
        if (!empty($session['extra_minutes']) && $session['extra_minutes'] > 0) {
            // Denda/tambahan waktu dihitung proporsional dari harga paket
            // (Harga Paket / Durasi Paket) * Extra Minutes
            $extraCharge = ($pkgBasePrice / $pkgDuration) * $session['extra_minutes'];
        }
        return round($pkgBasePrice + $extraCharge, 2);
    }
}
