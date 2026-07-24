<?php

class ProductController
{
    public function index(Request $request): void
    {
        $model = new Product();
        ResponseHelper::success($model->all());
    }

    public function store(Request $request): void
    {
        $v = new Validator($request->all(), [
            'name'        => 'required|string|max:100',
            'category_id' => 'numeric',
            'cost_price'  => 'numeric',
            'price'      => 'required|numeric',
            'stock'      => 'numeric',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $model = new Product();
        $payload = $request->all();
        
        // Simpan stok input untuk di-adjust, tapi di produk awalnya 0 (biar nggak dobel)
        $stock = (int) ($payload['stock'] ?? 0);
        $payload['stock'] = 0;
        
        $id = $model->create($payload);
        
        // Record initial stock adjustment if stock > 0
        if ($stock > 0) {
            $adjModel = new StockAdjustment();
            $adjModel->create([
                'product_id' => $id,
                'type'       => 'in',
                'qty'        => $stock,
                'note'       => 'Stok Awal (Input Baru)'
            ], $_SESSION['user_id']);
        }

        ResponseHelper::success($model->find($id), 'Produk berhasil ditambahkan', 201);
    }

    public function update(Request $request): void
    {
        $id = (int) $request->param('id');
        $model = new Product();

        if (!$model->find($id)) {
            ResponseHelper::notFound('Produk tidak ditemukan');
            return;
        }

        $v = new Validator($request->all(), [
            'name'        => 'required|string|max:100',
            'category_id' => 'numeric',
            'cost_price'  => 'numeric',
            'price'       => 'required|numeric',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $model->update($id, $request->all());
        ResponseHelper::success($model->find($id), 'Produk berhasil diupdate');
    }

    public function destroy(Request $request): void
    {
        $id = (int) $request->param('id');
        $model = new Product();

        if (!$model->find($id)) {
            ResponseHelper::notFound('Produk tidak ditemukan');
            return;
        }

        $model->delete($id);
        ResponseHelper::success(null, 'Produk berhasil dihapus');
    }
}
