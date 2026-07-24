<?php

require_once __DIR__ . '/../models/Settings.php';

class SettingsController
{
    public function get(Request $request): void
    {
        $model = new Settings();
        $settings = $model->getAll();
        ResponseHelper::success($settings);
    }

    public function update(Request $request): void
    {
        // Only admin should ideally do this, but we'll assume auth middleware handles basic access
        if ($_SESSION['user_role'] !== 'admin') {
            ResponseHelper::error('Unauthorized', 403);
            return;
        }

        $v = new Validator($request->all(), [
            'shift_start_time' => 'required',
            'shift_end_time' => 'required'
        ]);

        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        $model = new Settings();
        $model->update([
            'shift_start_time' => $request->input('shift_start_time'),
            'shift_end_time' => $request->input('shift_end_time')
        ]);

        ResponseHelper::success(null, 'Settings updated successfully');
    }
}
