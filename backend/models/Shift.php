<?php

class Shift
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function current(int $kasirId): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM shifts WHERE kasir_id = ? AND status = 'open' ORDER BY opened_at DESC LIMIT 1"
        );
        $stmt->execute([$kasirId]);
        $shift = $stmt->fetch();
        return $shift ?: null;
    }

    public function open(int $kasirId, float $openingBalance, float $openingDigitalBalance = 0): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO shifts (kasir_id, opening_balance, opening_digital_balance, status) VALUES (?, ?, ?, 'open')"
        );
        $stmt->execute([$kasirId, $openingBalance, $openingDigitalBalance]);
        return (int) $this->db->lastInsertId();
    }

    public function close(int $id, float $closingBalance, float $expectedBalance, float $difference, float $closingDigitalBalance = 0, float $expectedDigitalBalance = 0, float $digitalDifference = 0, ?string $closedAt = null): bool
    {
        $closedAt = $closedAt ?? date('Y-m-d H:i:s');
        $stmt = $this->db->prepare(
            "UPDATE shifts SET closing_balance = ?, expected_balance = ?, difference = ?, closing_digital_balance = ?, expected_digital_balance = ?, digital_difference = ?, status = 'closed', closed_at = ? WHERE id = ?"
        );
        return $stmt->execute([$closingBalance, $expectedBalance, $difference, $closingDigitalBalance, $expectedDigitalBalance, $digitalDifference, $closedAt, $id]);
    }

    public function getShiftTransactionsTotal(int $shiftId): float
    {
        $stmt = $this->db->prepare(
            "SELECT SUM(amount) as total FROM transactions WHERE shift_id = ? AND payment_method = 'cash'"
        );
        $stmt->execute([$shiftId]);
        $result = $stmt->fetch();
        return (float) ($result['total'] ?? 0);
    }

    public function getShiftExpensesTotal(int $shiftId): float
    {
        $stmt = $this->db->prepare(
            "SELECT SUM(amount) as total FROM expenses WHERE shift_id = ?"
        );
        $stmt->execute([$shiftId]);
        $result = $stmt->fetch();
        return (float) ($result['total'] ?? 0);
    }

    public function getShiftDigitalTransactionsTotal(int $shiftId): float
    {
        $stmt = $this->db->prepare(
            "SELECT SUM(amount) as total FROM transactions WHERE shift_id = ? AND payment_method IN ('qris', 'transfer')"
        );
        $stmt->execute([$shiftId]);
        $result = $stmt->fetch();
        return (float) ($result['total'] ?? 0);
    }
}
