<?php

class PromoController
{
    public function index(Request $request): void
    {
        $model = new Promo();
        ResponseHelper::success($model->all());
    }

    public function store(Request $request): void
    {
        $v = new Validator($request->all(), [
            'code'       => 'required|string|max:30',
            'type'       => 'required|in:percentage,fixed',
            'value'      => 'required|numeric',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $model = new Promo();
        if ($model->findByCode($request->input('code'))) {
            ResponseHelper::error('Kode promo sudah ada', 400);
            return;
        }
        
        $id = $model->create($request->all());
        ResponseHelper::success($model->find($id), 'Promo berhasil ditambahkan', 201);
    }

    public function update(Request $request): void
    {
        $id = (int) $request->param('id');
        $model = new Promo();

        if (!$model->find($id)) {
            ResponseHelper::notFound('Promo tidak ditemukan');
            return;
        }

        $v = new Validator($request->all(), [
            'code'       => 'required|string|max:30',
            'type'       => 'required|in:percentage,fixed',
            'value'      => 'required|numeric',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $model->update($id, $request->all());
        ResponseHelper::success($model->find($id), 'Promo berhasil diupdate');
    }

    public function destroy(Request $request): void
    {
        $id = (int) $request->param('id');
        $model = new Promo();

        if (!$model->find($id)) {
            ResponseHelper::notFound('Promo tidak ditemukan');
            return;
        }

        $model->delete($id);
        ResponseHelper::success(null, 'Promo berhasil dihapus');
    }

    public function validatePromo(Request $request): void
    {
        $code = $request->input('code');
        if (!$code) {
            ResponseHelper::error('Kode promo harus diisi', 400);
            return;
        }

        $model = new Promo();
        $promo = $model->findByCode($code);

        if (!$promo) {
            ResponseHelper::error('Kode promo tidak valid atau sudah tidak aktif', 404);
            return;
        }

        // Check date validity if set
        $now = date('Y-m-d H:i:s');
        if (!empty($promo['valid_from']) && $promo['valid_from'] > $now) {
            ResponseHelper::error('Kode promo belum aktif', 400);
            return;
        }
        if (!empty($promo['valid_until']) && $promo['valid_until'] < $now) {
            ResponseHelper::error('Kode promo sudah kadaluarsa', 400);
            return;
        }

        ResponseHelper::success($promo, 'Promo valid');
    }
}
