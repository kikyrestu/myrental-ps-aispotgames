<?php

class MemberController
{
    private Member $memberModel;

    public function __construct()
    {
        $this->memberModel = new Member();
    }

    public function index(Request $request): void
    {
        $members = $this->memberModel->all();
        Response::json(['success' => true, 'data' => $members]);
    }

    public function store(Request $request): void
    {
        $data = $request->body;
        if (empty($data['name'])) {
            Response::json(['success' => false, 'message' => 'Nama member wajib diisi'], 400);
            return;
        }

        if (!empty($data['phone'])) {
            $existing = $this->memberModel->findByPhone($data['phone']);
            if ($existing) {
                Response::json(['success' => false, 'message' => 'Nomor HP sudah terdaftar'], 400);
                return;
            }
        }

        $id = $this->memberModel->create($data);
        Response::json(['success' => true, 'message' => 'Member berhasil ditambahkan', 'data' => ['id' => $id]]);
    }

    public function update(Request $request): void
    {
        $id = (int)$request->params['id'];
        $data = $request->body;

        if (empty($data['name'])) {
            Response::json(['success' => false, 'message' => 'Nama member wajib diisi'], 400);
            return;
        }

        $this->memberModel->update($id, $data);
        Response::json(['success' => true, 'message' => 'Member berhasil diupdate']);
    }

    // Untuk demo/MVP kita tidak ada delete member dulu, karena butuh soft delete 
    // agar data transaksi historis tidak rusak.
}
