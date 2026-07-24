<?php

class ExpenseController
{
    public function index(Request $request): void
    {
        $model = new Expense();
        $shiftId = $request->input('shift_id');
        
        if ($shiftId) {
            ResponseHelper::success($model->allByShift((int)$shiftId));
        } else {
            ResponseHelper::success($model->all());
        }
    }

    public function store(Request $request): void
    {
        $v = new Validator($request->all(), [
            'category' => 'required|string|max:50',
            'amount'   => 'required|numeric',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $kasirId = (int) $_SESSION['user_id'];
        $shiftModel = new Shift();
        $shift = $shiftModel->current($kasirId);
        
        if (!$shift) {
            ResponseHelper::error('Anda harus membuka shift terlebih dahulu untuk mencatat pengeluaran', 400);
            return;
        }

        $data = $request->all();
        $data['kasir_id'] = $kasirId;
        $data['shift_id'] = $shift['id'];

        $model = new Expense();
        $id = $model->create($data);
        
        ResponseHelper::success(['id' => $id], 'Pengeluaran berhasil dicatat', 201);
    }
}
