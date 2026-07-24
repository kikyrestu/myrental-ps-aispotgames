<?php

/**
 * Endpoint ini gak ada di daftar API awal di plan, tapi frontend (SessionForm)
 * butuh daftar paket buat dropdown pilihan pas mulai sesi. Read-only aja,
 * CRUD paket bisa ditambah gampang di Fase 3 bareng promo.
 */
class PackageController
{
    public function index(Request $request): void
    {
        $model = new Package();
        // Kasir hanya lihat paket aktif, admin bisa lihat semua
        if (!empty($_SESSION['role']) && $_SESSION['role'] === 'admin') {
            $stmt = Database::getConnection()->query('SELECT * FROM packages ORDER BY duration_minutes');
            ResponseHelper::success($stmt->fetchAll());
        } else {
            ResponseHelper::success($model->all()); // all() sudah filter is_active = 1
        }
    }

    public function store(Request $request): void
    {
        $v = new Validator($request->all(), [
            'name'             => 'required',
            'duration_minutes' => 'required|numeric',
            'price'            => 'required|numeric'
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $model = new Package();
        $pkg = $model->create($request->all());
        ResponseHelper::success($pkg, 'Paket berhasil ditambahkan', 201);
    }

    public function update(Request $request): void
    {
        $id = (int) $request->param('id');
        $v = new Validator($request->all(), [
            'name'             => 'required',
            'duration_minutes' => 'required|numeric',
            'price'            => 'required|numeric'
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $model = new Package();
        if (!$model->find($id)) {
            ResponseHelper::notFound('Paket tidak ditemukan');
            return;
        }

        $pkg = $model->update($id, $request->all());
        ResponseHelper::success($pkg, 'Paket berhasil diupdate');
    }

    public function destroy(Request $request): void
    {
        $id = (int) $request->param('id');
        $model = new Package();
        $existing = $model->find($id);
        if (!$existing) {
            ResponseHelper::notFound('Paket tidak ditemukan');
            return;
        }

        try {
            $model->delete($id);
            ResponseHelper::success(null, 'Paket berhasil dihapus');
        } catch (\PDOException $e) {
            // BUG 11 FIX: Gunakan data existing untuk update, bukan array kosong
            $existing['is_active'] = 0;
            $model->update($id, $existing);
            ResponseHelper::success(null, 'Paket tidak bisa dihapus karena sedang dipakai. Status diubah menjadi Nonaktif.');
        }
    }
}
