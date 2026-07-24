import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { formatRupiah } from '../utils/format';

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    cost_price: '',
    price: '',
    stock: ''
  });

  const fetchProducts = async () => {
    try {
      const [resProd, resCat] = await Promise.all([
        api.get('/products'),
        api.get('/product-categories')
      ]);
      setProducts(resProd || []);
      setCategories(resCat || []);
    } catch (err) {
      alert('Gagal mengambil data produk/kategori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        category_id: product.category_id || (categories.length > 0 ? categories[0].id : ''),
        cost_price: product.cost_price,
        price: product.price,
        stock: product.stock
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        cost_price: '',
        price: '',
        stock: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        category_id: formData.category_id,
        cost_price: Number(formData.cost_price),
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Gagal menghapus produk');
    }
  };

  if (loading) return <div className="app-loading">Memuat...</div>;

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>Manajemen Produk</h1>
          <p className="page__subtitle">Kelola daftar makanan, minuman, dan barang jualan lainnya.</p>
        </div>
        <button className="btn btn--primary" onClick={() => handleOpenModal()}>
          + Tambah Produk
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Nama Produk</th>
              <th>Harga Modal (HPP)</th>
              <th>Harga Jual</th>
              <th>Sisa Stok</th>
              <th width="120">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty">Belum ada data produk</td>
              </tr>
            ) : (
              products.map(p => (
                <tr key={p.id}>
                  <td data-label="Kategori">{p.category_name || '-'}</td>
                  <td data-label="Nama Produk">{p.name}</td>
                  <td data-label="Harga Modal">{formatRupiah(p.cost_price)}</td>
                  <td data-label="Harga Jual">{formatRupiah(p.price)}</td>
                  <td data-label="Stok">
                    <strong style={{ color: p.stock <= 5 ? 'var(--critical)' : 'inherit' }}>
                      {p.stock}
                    </strong>
                  </td>
                  <td data-label="Aksi">
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => handleOpenModal(p)}>Edit</button>
                      <button className="btn btn--ghost btn--sm" style={{ color: 'var(--critical)' }} onClick={() => handleDelete(p.id)}>Hapus</button>
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
              <h2>{editingId ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button className="modal__close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              <label className="form__field">
                Kategori
                <select
                  value={formData.category_id}
                  onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="form__field">
                Nama Produk
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Indomie Goreng Telur"
                />
              </label>
              <div className="form-row">
                <label className="form__field" style={{ flex: 1 }}>
                  Harga Modal (HPP)
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.cost_price}
                    onChange={e => setFormData({ ...formData, cost_price: e.target.value })}
                  />
                </label>
                <label className="form__field" style={{ flex: 1 }}>
                  Harga Jual
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                  />
                </label>
              </div>
              {!editingId && (
                <label className="form__field">
                  Stok Awal
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                  />
                </label>
              )}
              
              <div className="form__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn--primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
