import { useState, useEffect } from 'react';
import { transactionsApi } from '../../api/transactions';
import { formatRupiah } from '../../utils/format';
import { Printer } from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';

export default function ReceiptModal({ transactionId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transactionId) {
      fetchDetails();
    }
  }, [transactionId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await transactionsApi.getDetails(transactionId);
      setData(res);
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil detail transaksi');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Modal title="Detail Transaksi" onClose={onClose}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Memuat struk...</div>
      </Modal>
    );
  }

  if (!data) return null;

  return (
    <Modal title="Struk Transaksi" onClose={onClose}>
      <div className="receipt" style={{ padding: '16px', background: 'var(--surface)', color: 'var(--text)', borderRadius: '8px', minWidth: '320px', fontFamily: 'monospace', fontSize: '14px' }}>
        <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '12px', marginBottom: '12px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '18px' }}>RENTAL PS</h2>
          <div>Waktu: {new Date(data.created_at).toLocaleString('id-ID')}</div>
          <div>Kasir: {data.kasir_name}</div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div><strong>Trx ID:</strong> #{data.id}</div>
          <div><strong>Kategori:</strong> {data.category === 'sewa' ? 'Sewa PS' : 'F&B'}</div>
          {data.customer_name && <div><strong>Pelanggan:</strong> {data.customer_name}</div>}
        </div>

        <table style={{ width: '100%', marginBottom: '12px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px dashed var(--border)' }}>
              <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Item</th>
              <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {data.duration_minutes > 0 && (
              <tr>
                <td style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                  Sewa Unit {data.unit_id}<br/>
                  <small style={{ color: 'var(--text-muted)' }}>{data.duration_minutes} menit</small>
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '8px' }}>
                  {/* Amount calculated as total_amount - items_total */}
                  {formatRupiah(data.amount - (data.items || []).reduce((sum, i) => sum + Number(i.subtotal), 0))}
                </td>
              </tr>
            )}
            
            {data.items && data.items.map(item => (
              <tr key={item.id}>
                <td style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                  {item.item_name}<br/>
                  <small style={{ color: 'var(--text-muted)' }}>{item.qty} x {formatRupiah(item.unit_price)}</small>
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '8px' }}>
                  {formatRupiah(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px', textAlign: 'right' }}>
          {Number(data.discount_amount) > 0 && (
            <div style={{ marginBottom: '4px' }}>
              Diskon: <span style={{ color: 'var(--critical)' }}>-{formatRupiah(data.discount_amount)}</span>
            </div>
          )}
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            Total: {formatRupiah(Number(data.amount) - Number(data.discount_amount))}
          </div>
          <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Metode: {data.payment_method.toUpperCase()}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Button variant="primary" size="sm" onClick={() => window.print()} style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
            <Printer size={16} /> Cetak Struk
          </Button>
        </div>
      </div>
    </Modal>
  );
}
