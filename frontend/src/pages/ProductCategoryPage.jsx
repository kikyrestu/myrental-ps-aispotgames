import { useState, useEffect } from 'react';
import { productCategoriesApi } from '../api/productCategories';
import Modal from '../components/shared/Modal';

export default function ProductCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  
  const [dialog, setDialog] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await productCategoriesApi.list();
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Gagal memuat kategori');
    }
  };

  const showAlert = (title, message) => setDialog({ isOpen: true, type: 'info', title, message });
  const showConfirm = (title, message, onConfirm) => setDialog({ isOpen: true, type: 'confirm', title, message, onConfirm });

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingId(cat.id);
      setFormData({ name: cat.name });
    } else {
      setEditingId(null);
      setFormData({ name: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productCategoriesApi.update(editingId, formData);
        showAlert('Sukses', 'Kategori berhasil diupdate');
      } else {
        await productCategoriesApi.create(formData);
        showAlert('Sukses', 'Kategori berhasil ditambahkan');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      showAlert('Gagal', err.response?.data?.message || err.message);
    }
  };

  const handleDelete = (id) => {
    showConfirm('Hapus Kategori', 'Yakin ingin menghapus kategori ini? Jika kategori masih dipakai oleh produk, penghapusan akan gagal.', async () => {
      try {
        await productCategoriesApi.delete(id);
        showAlert('Sukses', 'Kategori berhasil dihapus');
        fetchCategories();
      } catch (err) {
        showAlert('Gagal', err.response?.data?.message || err.message);
      }
    });
  };

  return (
    <div className="page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="page__header" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Manajemen Kategori Produk</h1>
        <button className="btn btn--primary" onClick={() => handleOpenModal()}>
          + Tambah Kategori
        </button>
      </header>

      <div className="table-container" style={{ flex: 1 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Nama Kategori</th>
              <th style={{ width: 150 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Belum ada kategori produk.
                </td>
              </tr>
            ) : (
              categories.map(c => (
                <tr key={c.id}>
                  <td data-label="Nama Kategori">{c.name}</td>
                  <td data-label="Aksi">
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => handleOpenModal(c)}>Edit</button>
                      <button className="btn btn--ghost btn--sm" style={{ color: 'var(--critical)' }} onClick={() => handleDelete(c.id)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <h2>{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button className="modal__close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              <label className="form__field">
                Nama Kategori
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Snack, Minuman Dingin, dll"
                />
              </label>
              <div style={{ display: 'flex', gap: '12px', marginTop: 24 }}>
                <button type="button" className="btn btn--outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn--primary" style={{ flex: 1 }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {dialog.isOpen && (
        <Modal
          title={dialog.title}
          onClose={() => setDialog({ ...dialog, isOpen: false })}
          type={dialog.type}
          onConfirm={() => {
            if (dialog.onConfirm) dialog.onConfirm();
            setDialog({ ...dialog, isOpen: false });
          }}
        >
          {dialog.message}
        </Modal>
      )}
    </div>
  );
}
