<?php

class FixedExpenseController
{
    public function index(Request $request): void
    {
        $model = new FixedExpense();
        ResponseHelper::success($model->all());
    }

    public function store(Request $request): void
    {
        $v = new Validator($request->all(), [
            "expense_date" => "required|string",
            "category"     => "required|string",
            "amount"       => "required|numeric",
        ]);
        
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $data = $request->all();
        $data["user_id"] = $_SESSION["user_id"] ?? null;

        $model = new FixedExpense();
        $id = $model->create($data);
        
        ResponseHelper::success(["id" => $id], "Pengeluaran operasional berhasil dicatat", 201);
    }

    public function destroy(Request $request): void
    {
        $id = (int) $request->param("id");
        $model = new FixedExpense();
        $success = $model->delete($id);
        
        if ($success) {
            ResponseHelper::success(null, "Data berhasil dihapus");
        } else {
            ResponseHelper::error("Gagal menghapus data", 500);
        }
    }
}

