<?php

class ProductCategoryController
{
    private ProductCategory $categoryModel;

    public function __construct()
    {
        $this->categoryModel = new ProductCategory();
    }

    public function index(Request $request): void
    {
        $categories = $this->categoryModel->all();
        ResponseHelper::success($categories);
    }

    public function create(Request $request): void
    {
        $name = trim($request->input('name', ''));
        if (!$name) {
            ResponseHelper::error('Nama kategori wajib diisi', 400);
            return;
        }

        try {
            $id = $this->categoryModel->create(['name' => $name]);
            $category = $this->categoryModel->find($id);
            ResponseHelper::success($category, 'Kategori berhasil ditambahkan', 201);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Duplicate entry
                ResponseHelper::error('Kategori dengan nama ini sudah ada', 400);
            } else {
                ResponseHelper::error($e->getMessage(), 500);
            }
        }
    }

    public function update(Request $request): void
    {
        $id = (int) $request->param('id');
        $name = trim($request->input('name', ''));

        if (!$name) {
            ResponseHelper::error('Nama kategori wajib diisi', 400);
            return;
        }

        $category = $this->categoryModel->find($id);
        if (!$category) {
            ResponseHelper::error('Kategori tidak ditemukan', 404);
            return;
        }

        try {
            $this->categoryModel->update($id, ['name' => $name]);
            $category = $this->categoryModel->find($id);
            ResponseHelper::success($category, 'Kategori berhasil diupdate');
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                ResponseHelper::error('Kategori dengan nama ini sudah ada', 400);
            } else {
                ResponseHelper::error($e->getMessage(), 500);
            }
        }
    }

    public function destroy(Request $request): void
    {
        $id = (int) $request->param('id');
        $category = $this->categoryModel->find($id);

        if (!$category) {
            ResponseHelper::error('Kategori tidak ditemukan', 404);
            return;
        }

        try {
            $this->categoryModel->delete($id);
            ResponseHelper::success(null, 'Kategori berhasil dihapus');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), 400);
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), 500);
        }
    }
}
