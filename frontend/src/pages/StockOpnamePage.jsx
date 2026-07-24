import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function StockOpnamePage() {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'in',
    qty: '',
    note: ''
  });

  const fetchData = async () => {
    try {
      const [stockRes, prodRes] = await Promise.all([
        api.get('/stocks'),
        api.get('/products')
      ]);
      setStocks(stockRes || []);
      setProducts(prodRes || []);
    } catch (err) {
      alert('Gagal mengambil data stok');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stocks', {
        product_id: Number(formData.product_id),
        type: formData.type,
        qty: Number(formData.qty),
        note: formData.note
      });
      setShowModal(false);
      setFormData({ product_id: '', type: 'in', qty: '', note: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan penyesuaian stok');
    }
  };

  if (loading) return <div className="app-loading">Memuat...</div>;

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>Stok Opname</h1>
          <p className="page__subtitle">Riwayat pergerakan barang dan penyesuaian stok.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          + Sesuaikan Stok
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Kasir</th>
              <th>Produk</th>
              <th>Jenis</th>
              <th>Qty</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty">Belum ada riwayat stok</td>
              </tr>
            ) : (
              stocks.map(s => (
                <tr key={s.id}>
                  <td data-label="Waktu">{new Date(s.created_at).toLocaleString('id-ID')}</td>
                  <td data-label="Kasir">{s.kasir_name}</td>
                  <td data-label="Produk">{s.product_name}</td>
                  <td data-label="Jenis">
                    <span style={{ 
                      color: s.type === 'in' ? 'var(--success)' : 
                             (s.type === 'out' ? 'var(--critical)' : 'var(--warning)'),
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontSize: '12px'
                    }}>
                      {s.type === 'in' ? 'Masuk' : (s.type === 'out' ? 'Keluar' : 'Penyesuaian')}
                    </span>
                  </td>
                  <td data-label="Qty">
                    {s.type === 'in' ? '+' : (s.type === 'out' ? '-' : '')}{s.qty}
                  </td>
                  <td data-label="Catatan" style={{ color: 'var(--text-muted)' }}>{s.note || '-'}</td>
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
              <h2>Penyesuaian Stok</h2>
              <button className="modal__close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              <label className="form__field">
                Produk
                <select
                  required
                  value={formData.product_id}
                  onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                >
                  <option value="">-- Pilih Produk --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Sisa: {p.stock})</option>
                  ))}
                </select>
              </label>

              <label className="form__field">
                Jenis Transaksi
                <select
                  required
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="in">Masuk (Kulakan/Restock)</option>
                  <option value="out">Keluar (Rusak/Expired/Retur)</option>
                  <option value="adjustment">Opname (Koreksi)</option>
                </select>
              </label>

              <label className="form__field">
                Kuantitas (Jumlah Barang)
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.qty}
                  onChange={e => setFormData({ ...formData, qty: e.target.value })}
                />
              </label>

              <label className="form__field">
                Catatan
                <input
                  type="text"
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Opsional (misal: Barang Kadaluarsa)"
                />
              </label>
              
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
