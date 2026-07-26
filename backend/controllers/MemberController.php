<?php

class MemberController
{
    private Member $memberModel;

    public function __construct()
    {
        $this->memberModel = new Member();
    }

    public function index(Request $request): void
    {
        $members = $this->memberModel->all();
        Response::json(['success' => true, 'data' => $members]);
    }

    public function store(Request $request): void
    {
        $data = $request->body;
        if (empty($data['name'])) {
            Response::json(['success' => false, 'message' => 'Nama member wajib diisi'], 400);
            return;
        }

        if (!empty($data['phone'])) {
            $existing = $this->memberModel->findByPhone($data['phone']);
            if ($existing) {
                Response::json(['success' => false, 'message' => 'Nomor HP sudah terdaftar'], 400);
                return;
            }
        }

        $amount = (float)($data['amount'] ?? 0);
        $minutes = (int)($data['time_balance'] ?? 0);
        $paymentMethod = $data['payment_method'] ?? 'cash';

        if ($amount > 0) {
            $kasirId = (int) ($_SESSION['user_id'] ?? 1);
            $shiftModel = new Shift();
            $shift = $shiftModel->current($kasirId);
            if (!$shift) {
                Response::json(['success' => false, 'message' => 'Anda harus membuka shift terlebih dahulu untuk mencatat transaksi bayar saldo'], 400);
                return;
            }
        }

        $id = $this->memberModel->create($data);

        if ($amount > 0) {
            $kasirId = (int) ($_SESSION['user_id'] ?? 1);
            $shiftModel = new Shift();
            $shift = $shiftModel->current($kasirId);
            $shiftId = $shift ? $shift['id'] : null;

            $trxModel = new Transaction();
            $trxModel->create([
                'session_id'      => null,
                'shift_id'        => $shiftId,
                'category'        => 'sewa',
                'payment_method'  => $paymentMethod,
                'amount'          => $amount,
                'discount_amount' => 0,
                'notes'           => "Daftar Member & Top-up Saldo Waktu: {$data['name']} (+{$minutes} Menit)",
            ], $kasirId);
        }

        Response::json(['success' => true, 'message' => 'Member berhasil ditambahkan', 'data' => ['id' => $id]]);
    }

    public function update(Request $request): void
    {
        $id = (int)$request->params['id'];
        $data = $request->body;

        if (empty($data['name'])) {
            Response::json(['success' => false, 'message' => 'Nama member wajib diisi'], 400);
            return;
        }

        $this->memberModel->update($id, $data);
        Response::json(['success' => true, 'message' => 'Member berhasil diupdate']);
    }

    public function addTime(Request $request): void
    {
        $id = (int)$request->params['id'];
        $minutes = (int)($request->body['minutes'] ?? 0);
        $amount = (float)($request->body['amount'] ?? 0);
        $paymentMethod = $request->body['payment_method'] ?? 'cash';

        if ($minutes === 0) {
            Response::json(['success' => false, 'message' => 'Jumlah menit tidak boleh 0'], 400);
            return;
        }

        $member = $this->memberModel->find($id);
        if (!$member) {
            Response::json(['success' => false, 'message' => 'Member tidak ditemukan'], 404);
            return;
        }

        if ($amount > 0) {
            $kasirId = (int) ($_SESSION['user_id'] ?? 1);
            $shiftModel = new Shift();
            $shift = $shiftModel->current($kasirId);
            if (!$shift) {
                Response::json(['success' => false, 'message' => 'Anda harus membuka shift terlebih dahulu untuk mencatat transaksi top-up berbayar'], 400);
                return;
            }
        }

        if ($minutes > 0) {
            $this->memberModel->addTime($id, $minutes);
        } else {
            $this->memberModel->deductTime($id, abs($minutes));
        }

        if ($amount > 0) {
            $kasirId = (int) ($_SESSION['user_id'] ?? 1);
            $shiftModel = new Shift();
            $shift = $shiftModel->current($kasirId);
            $shiftId = $shift ? $shift['id'] : null;

            $trxModel = new Transaction();
            $trxModel->create([
                'session_id'      => null,
                'shift_id'        => $shiftId,
                'category'        => 'sewa',
                'payment_method'  => $paymentMethod,
                'amount'          => $amount,
                'discount_amount' => 0,
                'notes'           => "Top-up Saldo Deposit Waktu Member: {$member['name']} ({$minutes} Menit)",
            ], $kasirId);
        }

        $updated = $this->memberModel->find($id);
        Response::json(['success' => true, 'message' => 'Saldo waktu member berhasil diperbarui', 'data' => $updated]);
    }

    // Untuk demo/MVP kita tidak ada delete member dulu, karena butuh soft delete 
    // agar data transaksi historis tidak rusak.
}
