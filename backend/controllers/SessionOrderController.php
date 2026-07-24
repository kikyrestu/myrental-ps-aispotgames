<?php

class SessionOrderController
{
    public function index(Request $request): void
    {
        $sessionId = (int) $request->param('sessionId');
        $model = new SessionOrder();
        ResponseHelper::success($model->getBySession($sessionId));
    }

    public function store(Request $request): void
    {
        $sessionId = (int) $request->param('sessionId');
        $v = new Validator($request->all(), [
            'item_name'  => 'required|string|max:100',
            'qty'        => 'required|integer|min:1',
            'unit_price' => 'required|numeric',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        try {
            $data = $request->all();
            $data['session_id'] = $sessionId;
            
            $model = new SessionOrder();
            $id = $model->create($data);
            
            ResponseHelper::success(['id' => $id], 'Order berhasil ditambahkan', 201);
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), 422);
        }
    }
}
