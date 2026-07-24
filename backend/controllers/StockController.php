<?php

class StockController
{
    public function index(Request $request): void
    {
        $model = new StockAdjustment();
        ResponseHelper::success($model->all());
    }

    public function store(Request $request): void
    {
        $v = new Validator($request->all(), [
            'product_id' => 'required|integer',
            'type'       => 'required|in:in,out,adjustment',
            'qty'        => 'required|integer|min:1',
        ]);
        
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        try {
            $model = new StockAdjustment();
            $id = $model->create($request->all(), (int) $_SESSION['user_id']);
            ResponseHelper::success(['id' => $id], 'Stok berhasil disesuaikan', 201);
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), 422);
        }
    }
}
