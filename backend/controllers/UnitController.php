<?php

class UnitController
{
    public function index(Request $request): void
    {
        $model = new Unit();
        ResponseHelper::success($model->all());
    }

    public function store(Request $request): void
    {
        $v = new Validator($request->all(), [
            'name'         => 'required|string|max:50',
            'console_type' => 'string|max:30',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        try {
            $model = new Unit();
            $id = $model->create($request->all());
            ResponseHelper::success($model->find($id), 'Unit berhasil ditambahkan', 201);
        } catch (\Throwable $e) {
            ResponseHelper::error('Gagal menambah unit: ' . $e->getMessage(), 500);
        }
    }

    public function update(Request $request): void
    {
        $id = (int) $request->param('id');
        $model = new Unit();

        if (!$model->find($id)) {
            ResponseHelper::notFound('Unit tidak ditemukan');
            return;
        }

        $v = new Validator($request->all(), [
            'name'        => 'required|string|max:50',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        try {
            $model->update($id, $request->all());
            ResponseHelper::success($model->find($id), 'Unit berhasil diupdate');
        } catch (\Throwable $e) {
            ResponseHelper::error('Gagal update unit: ' . $e->getMessage(), 500);
        }
    }

    public function updateStatus(Request $request): void
    {
        $id = (int) $request->param('id');
        $model = new Unit();

        if (!$model->find($id)) {
            ResponseHelper::notFound('Unit tidak ditemukan');
            return;
        }

        $v = new Validator($request->all(), [
            'status' => 'required|in:kosong,dipakai,maintenance',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $model->updateStatus($id, $request->input('status'));
        ResponseHelper::success($model->find($id), 'Status unit berhasil diupdate');
    }

    public function destroy(Request $request): void
    {
        $id = (int) $request->param('id');
        $model = new Unit();

        if (!$model->find($id)) {
            ResponseHelper::notFound('Unit tidak ditemukan');
            return;
        }

        $model->delete($id);
        ResponseHelper::success(null, 'Unit berhasil dihapus');
    }
}
