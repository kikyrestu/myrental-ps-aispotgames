<?php

class OwnerController
{
    public function index(Request $request): void
    {
        $model = new Owner();
        ResponseHelper::success($model->all());
    }

    public function store(Request $request): void
    {
        $v = new Validator($request->all(), [
            'name' => 'required|string|max:100',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        try {
            $model = new Owner();
            $owner = $model->create($request->all());
            ResponseHelper::success($owner, 'Investor berhasil ditambahkan', 201);
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), 422);
        }
    }

    public function update(Request $request): void
    {
        $id = (int) $request->param('id');
        $v = new Validator($request->all(), [
            'name' => 'required|string|max:100',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        try {
            $model = new Owner();
            $owner = $model->update($id, $request->all());
            ResponseHelper::success($owner, 'Data investor berhasil diupdate');
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), 422);
        }
    }

    public function destroy(Request $request): void
    {
        $id = (int) $request->param('id');
        try {
            $model = new Owner();
            $model->delete($id);
            ResponseHelper::success(null, 'Investor berhasil dihapus');
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), 422);
        }
    }
}
