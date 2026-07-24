<?php

class CommissionController
{
    public function index(Request $request): void
    {
        $model = new Commission();
        ResponseHelper::success($model->getReportPerOwner());
    }

    public function details(Request $request): void
    {
        $ownerId = (int) $request->param('ownerId');
        $status = $request->input('status', 'all'); // 'all', 'paid', 'unpaid'
        
        $model = new Commission();
        $details = $model->getDetailsByOwner($ownerId, $status);
        ResponseHelper::success($details);
    }

    public function pay(Request $request): void
    {
        $ownerId = (int) $request->param('ownerId');
        try {
            $model = new Commission();
            $count = $model->payCommissions($ownerId);
            ResponseHelper::success(['paid_count' => $count], "$count komisi berhasil ditandai lunas");
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), 422);
        }
    }
}
