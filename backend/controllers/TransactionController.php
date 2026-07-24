<?php

class TransactionController
{
    public function index(Request $request): void
    {
        $model = new Transaction();
        $data = $model->all(
            $request->input('date_from'),
            $request->input('date_to')
        );
        ResponseHelper::success($data);
    }

    public function show(Request $request): void
    {
        $id = (int) $request->param('id');
        $model = new Transaction();
        
        $data = $model->findWithDetails($id);
        if (!$data) {
            ResponseHelper::notFound('Transaksi tidak ditemukan');
            return;
        }

        ResponseHelper::success($data);
    }

    /**
     * Buat catat transaksi manual (di luar alur sesi), misal jual produk
     * lepas atau pemasukan lain-lain.
     */
    public function store(Request $request): void
    {
        $v = new Validator($request->all(), [
            'amount'   => 'required|numeric',
            'category' => 'required|string|max:50',
        ]);
        // Also we can accept 'items' which is an array
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $kasirId = (int) $_SESSION['user_id'];
        $shiftModel = new Shift();
        $shift = $shiftModel->current($kasirId);
        if (!$shift) {
            ResponseHelper::error('Anda harus membuka shift terlebih dahulu untuk mencatat transaksi', 400);
            return;
        }

        $data = $request->all();
        $data['shift_id'] = $shift['id'];

        $model = new Transaction();
        $id = $model->create($data, $kasirId);

        // Handle Kasbon / Piutang
        $paymentMethod = $data['payment_method'] ?? 'cash';
        if ($paymentMethod === 'kasbon') {
            $debtModel = new Debt();
            $personName = $request->input('kasbon_person_name');
            if (!$personName) {
                $personName = 'Guest (Belum diberi nama)';
            }
            $debtModel->create([
                'type' => 'piutang',
                'person_name' => $personName,
                'description' => 'Kasbon F&B / Transaksi Lepas (Trx #' . $id . ')',
                'amount' => (float)$data['amount'],
                'kasir_id' => $kasirId
            ]);
        }

        ResponseHelper::success(['id' => $id], 'Transaksi tercatat', 201);
    }
}
