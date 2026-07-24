<?php

class DebtController
{
    public function index(Request $request): void
    {
        $model = new Debt();
        ResponseHelper::success($model->all());
    }

    public function store(Request $request): void
    {
        $v = new Validator($request->all(), [
            'type'        => 'required|string',
            'person_name' => 'required|string|max:255',
            'amount'      => 'required|numeric',
        ]);
        
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $data = $request->all();
        if (!in_array($data['type'], ['utang', 'piutang'])) {
            ResponseHelper::validationError(['type' => 'Type must be utang or piutang']);
            return;
        }

        // Set due_date to null if it's empty string
        if (empty($data['due_date'])) {
            $data['due_date'] = null;
        }

        $data['kasir_id'] = $_SESSION['user_id'] ?? null;

        $model = new Debt();
        $id = $model->create($data);
        
        // Handle deduct_drawer if type is piutang
        $deductDrawer = filter_var($request->input('deduct_drawer', false), FILTER_VALIDATE_BOOLEAN);
        if ($data['type'] === 'piutang' && $deductDrawer) {
            $shiftModel = new Shift();
            $shift = $shiftModel->current((int)$data['kasir_id']);
            if ($shift) {
                $expenseModel = new Expense();
                $expenseModel->create([
                    'shift_id' => $shift['id'],
                    'category' => 'Piutang / Pinjaman',
                    'description' => 'Piutang: ' . $data['person_name'] . ($data['description'] ? ' (' . $data['description'] . ')' : ''),
                    'amount' => $data['amount'],
                    'kasir_id' => (int)$data['kasir_id']
                ]);
            }
        }
        
        ResponseHelper::success(['id' => $id], ucfirst($data['type']) . ' berhasil dicatat', 201);
    }

    public function pay(Request $request): void
    {
        $id = (int) $request->param('id');
        $model = new Debt();
        $success = $model->updateStatus($id, 'paid');
        
        if ($success) {
            ResponseHelper::success(null, 'Status berhasil diubah menjadi lunas');
        } else {
            ResponseHelper::error('Gagal mengubah status', 500);
        }
    }

    public function destroy(Request $request): void
    {
        $id = (int) $request->param('id');
        
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM debts WHERE id = ?');
        $stmt->execute([$id]);
        $debt = $stmt->fetch();

        $model = new Debt();
        $success = $model->delete($id);
        
        if ($success) {
            // Also try to delete associated expense if it was a piutang and deducted from drawer
            if ($debt && $debt['type'] === 'piutang') {
                $description = 'Piutang: ' . $debt['person_name'] . ($debt['description'] ? ' (' . $debt['description'] . ')' : '');
                $stmtExp = $db->prepare('DELETE FROM expenses WHERE category = "Piutang / Pinjaman" AND amount = ? AND description = ?');
                $stmtExp->execute([$debt['amount'], $description]);
            }
            ResponseHelper::success(null, 'Data berhasil dihapus');
        } else {
            ResponseHelper::error('Gagal menghapus data', 500);
        }
    }
}
