import { useState, useEffect } from 'react';
import { productCategoriesApi } from '../api/productCategories';
import Button from '../components/shared/Button';

export default function ProductCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await productCategoriesApi.list();
      setCategories(data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await productCategoriesApi.update(editingId, formData);
      } else {
        await productCategoriesApi.create(formData);
      }
      setFormData({ name: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan');
    }
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name });
    setEditingId(cat.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Jika kategori masih dipakai oleh produk, penghapusan akan gagal.')) return;
    try {
      await productCategoriesApi.delete(id);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menghapus kategori');
    }
  };

  const handleCancelEdit = () => {
    setFormData({ name: '' });
    setEditingId(null);
  };

  return (
    <div className="fade-in">
      {error && <div className="alert alert--error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div className="promo-layout">
        <div className="promo-form-card">
          <h2>{editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h2>
          <form onSubmit={handleSubmit} className="form">
            <label className="form__field">
              <span>Nama Kategori</span>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Misal: Snack, Minuman Dingin, dll"
              />
            </label>

            <div className="form__actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              {editingId && (
                <Button type="button" variant="ghost" onClick={handleCancelEdit} style={{ flex: 1 }}>
                  Batal
                </Button>
              )}
              <Button type="submit" variant="primary" style={{ flex: 1 }}>
                {editingId ? 'Simpan Edit' : 'Tambah Kategori'}
              </Button>
            </div>
          </form>
        </div>

        <div className="promo-table-section">
          <h2>Daftar Kategori Produk</h2>
          {loading ? (
            <p>Loading...</p>
          ) : categories.length === 0 ? (
            <div className="table-empty">Belum ada kategori produk.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Kategori</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td data-label="Nama Kategori">
                        <span className="badge">{cat.name}</span>
                      </td>
                      <td data-label="Aksi" style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(cat.id)}>Hapus</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

