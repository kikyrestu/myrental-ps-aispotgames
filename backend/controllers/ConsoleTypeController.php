<?php

class ConsoleTypeController
{
    public function index(Request $request): void
    {
        $model = new ConsoleType();
        ResponseHelper::success($model->all());
    }

    public function store(Request $request): void
    {
        $v = new Validator($request->all(), [
            'name' => 'required|string|max:50',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        try {
            $model = new ConsoleType();
            $data = $model->create($request->all());
            ResponseHelper::success($data, 'Tipe konsol berhasil ditambahkan', 201);
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) { // Integrity constraint violation (duplicate entry)
                ResponseHelper::error('Tipe konsol sudah ada', 400);
            } else {
                ResponseHelper::error('Gagal menambah tipe konsol: ' . $e->getMessage(), 500);
            }
        } catch (\Throwable $e) {
            ResponseHelper::error('Gagal menambah tipe konsol: ' . $e->getMessage(), 500);
        }
    }

    public function update(Request $request): void
    {
        $id = (int) $request->param('id');
        $model = new ConsoleType();

        if (!$model->find($id)) {
            ResponseHelper::notFound('Tipe konsol tidak ditemukan');
            return;
        }

        $v = new Validator($request->all(), [
            'name' => 'required|string|max:50',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        try {
            $data = $model->update($id, $request->all());
            ResponseHelper::success($data, 'Tipe konsol berhasil diupdate');
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) {
                ResponseHelper::error('Tipe konsol sudah ada', 400);
            } else {
                ResponseHelper::error('Gagal update tipe konsol: ' . $e->getMessage(), 500);
            }
        } catch (\Throwable $e) {
            ResponseHelper::error('Gagal update tipe konsol: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(Request $request): void
    {
        $id = (int) $request->param('id');
        $model = new ConsoleType();

        if (!$model->find($id)) {
            ResponseHelper::notFound('Tipe konsol tidak ditemukan');
            return;
        }

        try {
            $model->delete($id);
            ResponseHelper::success(null, 'Tipe konsol berhasil dihapus');
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) { // Foreign key constraint violation check if any
                ResponseHelper::error('Tipe konsol ini sedang digunakan dan tidak dapat dihapus', 400);
            } else {
                ResponseHelper::error('Gagal hapus tipe konsol: ' . $e->getMessage(), 500);
            }
        }
    }
}
