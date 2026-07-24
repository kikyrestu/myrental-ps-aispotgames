import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { sessionsApi } from '../../api/sessions';
import { Utensils } from 'lucide-react';

export default function ProductOrderForm() {
  const [products, setProducts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    session_id: '', // Kosong berarti direct sell
    product_id: '',
    qty: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, sessRes] = await Promise.all([
        api.get('/products'),
        sessionsApi.list('ongoing')
      ]);
      setProducts(prodRes || []);
      setSessions(sessRes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedProduct = products.find(p => p.id === Number(formData.product_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setLoading(true);
    try {
      if (formData.session_id) {
        // Gabung ke sesi
        await api.post(`/sessions/${formData.session_id}/orders`, {
          product_id: selectedProduct.id,
          item_name: selectedProduct.name,
          qty: Number(formData.qty),
          unit_price: selectedProduct.price
        });
        alert('Produk berhasil ditambahkan ke tagihan sesi!');
      } else {
        // Penjualan langsung
        await api.post('/transactions', {
          category: 'produk',
          amount: selectedProduct.price * Number(formData.qty),
          payment_method: 'cash',
          items: [{
            product_id: selectedProduct.id,
            item_name: selectedProduct.name,
            qty: Number(formData.qty),
            unit_price: selectedProduct.price
          }]
        });
        alert('Penjualan produk berhasil dicatat!');
      }
      
      // Reset & refresh
      setFormData({ ...formData, product_id: '', qty: 1 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan pesanan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-panel" style={{ borderTopColor: 'var(--success)' }}>
      <div className="expense-panel__header">
        <span className="expense-panel__icon"><Utensils size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /></span>
        <h3>Penjualan Produk</h3>
      </div>
      
      <form className="form" onSubmit={handleSubmit}>
        <label className="form__field">
          Produk
          <select 
            required 
            value={formData.product_id}
            onChange={e => setFormData({...formData, product_id: e.target.value})}
          >
            <option value="">-- Pilih Produk --</option>
            {products.map(p => (
              <option key={p.id} value={p.id} disabled={p.stock < 1}>
                {p.name} - Rp{p.price.toLocaleString('id-ID')} {p.stock < 1 ? '(Habis)' : `(Stok: ${p.stock})`}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: '12px' }}>
          <label className="form__field" style={{ flex: 1 }}>
            Kuantitas
            <input 
              type="number" 
              required 
              min="1" 
              max={selectedProduct ? selectedProduct.stock : 99}
              value={formData.qty}
              onChange={e => setFormData({...formData, qty: e.target.value})}
            />
          </label>
          <label className="form__field" style={{ flex: 2 }}>
            Total Harga
            <div style={{ padding: '9px 12px', background: 'var(--surface-alt)', borderRadius: '8px', color: 'var(--text)' }}>
              Rp{((selectedProduct?.price || 0) * formData.qty).toLocaleString('id-ID')}
            </div>
          </label>
        </div>

        <label className="form__field">
          Gabung Tagihan Sesi? (Opsional)
          <select 
            value={formData.session_id}
            onChange={e => setFormData({...formData, session_id: e.target.value})}
          >
            <option value="">Langsung Bayar (Beli Putus)</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                PS {s.unit_id} - {s.customer_name || 'Tanpa Nama'}
              </option>
            ))}
          </select>
          {formData.session_id ? (
            <p className="form__hint" style={{color: 'var(--accent)'}}>Tagihan akan dibayar saat sesi PS selesai.</p>
          ) : (
            <p className="form__hint">Kasir langsung menerima uang cash sekarang.</p>
          )}
        </label>

        <button type="submit" className="btn btn--primary" disabled={loading || !formData.product_id}>
          {loading ? <span className="btn__spinner" /> : (formData.session_id ? 'Tambahkan ke Sesi' : 'Bayar Sekarang')}
        </button>
      </form>
    </div>
  );
}
