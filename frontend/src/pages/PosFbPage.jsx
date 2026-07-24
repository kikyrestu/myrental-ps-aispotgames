import { useState, useEffect } from 'react';
import { usePolling } from '../hooks/usePolling';
import { api } from '../api/client';
import { formatRupiah } from '../utils/format';
import { sessionsApi } from '../api/sessions';
import Modal from '../components/shared/Modal';
import { Utensils, ShoppingCart } from 'lucide-react';

export default function PosFbPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [cartFB, setCartFB] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [kasbonPersonName, setKasbonPersonName] = useState('');
  
  // Custom Modern Dialog
  const [dialog, setDialog] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

  // Get active sessions for the dropdown
  const { data: ongoingSessions } = usePolling(() => sessionsApi.list('ongoing'), 4000);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/product-categories')
      ]);
      setProducts(prodRes || []);
      setCategories(catRes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const showConfirm = (title, message, onConfirm) => {
    setDialog({ isOpen: true, type: 'confirm', title, message, onConfirm });
  };

  const showAlert = (title, message) => {
    setDialog({ isOpen: true, type: 'info', title, message, onConfirm: null });
  };

  const addToFBCart = (product) => {
    setCartFB(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map(item => item.product_id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, qty: 1, stock: product.stock }];
    });
  };

  const updateFBCartQty = (productId, delta) => {
    setCartFB(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQty = item.qty + delta;
        if (newQty < 1) return null;
        if (newQty > item.stock) return item;
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const handleCheckoutFB = () => {
    if (cartFB.length === 0) return;

    if (selectedSessionId) {
      const session = ongoingSessions?.find(s => s.id === Number(selectedSessionId));
      showConfirm('Tambahkan ke Tagihan', `Masukkan F&B ke tagihan unit ${session?.unit_name}?`, async () => {
        setSubmitting(true);
        try {
          for (const item of cartFB) {
            await api.post(`/sessions/${selectedSessionId}/orders`, {
              product_id: item.product_id,
              item_name: item.name,
              qty: item.qty,
              unit_price: item.price
            });
          }
          showAlert('Sukses', 'F&B ditambahkan ke tagihan sesi.');
          setCartFB([]);
          setSelectedSessionId('');
          fetchProducts();
        } catch (err) {
          showAlert('Gagal', err.response?.data?.message || err.message);
        } finally {
          setSubmitting(false);
        }
      });
    } else {
      showConfirm('Beli Putus', 'Lanjutkan proses Beli Putus?', async () => {
        setSubmitting(true);
        try {
          await api.post('/transactions', {
            category: 'produk',
            amount: cartFB.reduce((sum, item) => sum + (item.price * item.qty), 0),
            payment_method: paymentMethod,
            kasbon_person_name: kasbonPersonName,
            items: cartFB.map(item => ({
              product_id: item.product_id,
              item_name: item.name,
              qty: item.qty,
              unit_price: item.price
            }))
          });
          showAlert('Sukses', 'Pembayaran Beli Putus berhasil dicatat.');
          setCartFB([]);
          setKasbonPersonName('');
          fetchProducts();
        } catch (err) {
          showAlert('Gagal', err.response?.data?.message || err.message);
        } finally {
          setSubmitting(false);
        }
      });
    }
  };

  const total = cartFB.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  const filteredProducts = activeCategory 
    ? products.filter(p => p.category_id === activeCategory)
    : products;

  return (
    <div className="pos-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '16px 24px' }}>
      <header className="page__header" style={{ marginBottom: 16, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24 }}>POS F&B</h1>
          <p className="page__subtitle" style={{ fontSize: 13 }}>Kasir makanan dan minuman</p>
        </div>
      </header>

      <div className="pos-wrapper" style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
        {/* Kiri: Daftar Produk */}
        <div className="pos-main">
          
          {/* Kategori Tabs */}
          <div className="tabs" style={{ marginBottom: 16, padding: '0 24px' }}>
            <button 
              className={`tab-btn ${activeCategory === '' ? 'is-active' : ''}`}
              onClick={() => setActiveCategory('')}
            >
              Semua
            </button>
            {categories.map(c => (
              <button 
                key={c.id}
                className={`tab-btn ${activeCategory === c.id ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="pos-content">
            <div className="pos-grid">
              {filteredProducts.map(p => (
                <div key={p.id} className="pos-card" style={{ opacity: p.stock < 1 ? 0.5 : 1 }} onClick={() => p.stock > 0 && addToFBCart(p)}>
                  <div className="pos-card-icon"><Utensils size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /></div>
                  <div className="pos-card-title">{p.name}</div>
                  <div className="pos-card-subtitle" style={{ color: 'var(--accent)', fontWeight: 600 }}>{formatRupiah(p.price)}</div>
                  <div className="pos-card-subtitle" style={{ fontSize: 11 }}>Stok: {p.stock}</div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>Produk tidak ditemukan.</p>
              )}
            </div>
          </div>
        </div>

        {/* Kanan: Keranjang */}
        <div className="pos-sidebar">
          <div className="cart-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="cart-header" style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 18, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={20} /> Keranjang
              </h2>
            </div>
            
            <div className="cart-body" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {cartFB.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>Keranjang kosong</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {cartFB.map(item => (
                    <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatRupiah(item.price)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="btn btn--sm btn--ghost" onClick={() => updateFBCartQty(item.product_id, -1)}>-</button>
                        <span style={{ width: 20, textAlign: 'center' }}>{item.qty}</span>
                        <button className="btn btn--sm btn--ghost" onClick={() => updateFBCartQty(item.product_id, 1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cart-footer">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontWeight: 700, fontSize: 18 }}>
                <span>Total:</span>
                <span>{formatRupiah(total)}</span>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label className="form__field" style={{ marginBottom: '16px' }}>
                  <span>Pilih Sesi/Bilik yang Sedang Main (Opsional)</span>
                  <select 
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                  >
                    <option value="">-- Beli Putus (Walk-in) --</option>
                    {(ongoingSessions || []).map(s => (
                      <option key={s.id} value={s.id}>{s.unit_name} - {s.customer_name}</option>
                    ))}
                  </select>
                </label>
              </div>

              {!selectedSessionId && (
                <div style={{ marginBottom: 16 }}>
                  <label className="form__field" style={{ marginBottom: '16px' }}>
                    <span>Metode Pembayaran</span>
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="cash">Tunai (Cash)</option>
                      <option value="qris">QRIS</option>
                      <option value="transfer">Transfer Bank</option>
                      <option value="kasbon">Kasbon / Utang</option>
                    </select>
                  </label>

                  {paymentMethod === 'kasbon' && (
                    <label className="form__field" style={{ marginBottom: '16px' }}>
                      <span>Nama Pihak / Pelanggan yang Ngutang</span>
                      <input 
                        type="text" 
                        placeholder="Nama orang yang ngutang"
                        value={kasbonPersonName}
                        onChange={(e) => setKasbonPersonName(e.target.value)}
                      />
                    </label>
                  )}
                </div>
              )}

              <button 
                className="btn btn--primary" 
                style={{ width: '100%' }} 
                disabled={cartFB.length === 0 || submitting} 
                onClick={handleCheckoutFB}
              >
                {selectedSessionId ? 'Catat ke Tagihan Sesi' : 'Proses Pembayaran'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Dialog */}
      {dialog.isOpen && (
        <Modal title={dialog.title} onClose={() => setDialog({ ...dialog, isOpen: false })}>
          <p style={{ margin: '12px 0', fontSize: '15px' }}>{dialog.message}</p>
          <div className="modal__actions" style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            {dialog.type === 'confirm' && (
              <button className="btn btn--ghost" onClick={() => setDialog({ ...dialog, isOpen: false })}>Batal</button>
            )}
            <button className="btn btn--primary" onClick={() => {
              if (dialog.onConfirm) dialog.onConfirm();
              setDialog({ ...dialog, isOpen: false });
            }}>
              {dialog.type === 'confirm' ? 'Ya, Lanjutkan' : 'OK'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
