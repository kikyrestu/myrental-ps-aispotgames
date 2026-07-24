import { useState } from 'react';
import Button from '../shared/Button';

export default function PaymentForm({ session, onSubmit, onCancel, submitting }) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [promoCode, setPromoCode] = useState('');
  const [notes, setNotes] = useState('');
  const [saveTime, setSaveTime] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ paymentMethod, promo_code: promoCode, notes, save_time: saveTime });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <p className="form__hint">
        Sesi: <strong>{session.customer_name || 'Walk-in'}</strong> — {session.unit_name}
      </p>

      <label className="form__field">
        <span>Metode pembayaran</span>
        <select value={paymentMethod} onChange={(e) => {
          setPaymentMethod(e.target.value);
          if (e.target.value === 'deposit') setSaveTime(false);
        }}>
          <option value="cash">Tunai</option>
          <option value="qris">QRIS</option>
          <option value="transfer">Transfer</option>
          <option value="lainnya">Lainnya</option>
          {session.member_id && <option value="deposit">Deposit Waktu (Member)</option>}
        </select>
      </label>

      {session.member_id && paymentMethod !== 'deposit' && (
        <label className="form__field" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={saveTime} onChange={(e) => setSaveTime(e.target.checked)} />
          <span>Simpan sisa waktu ke deposit member?</span>
        </label>
      )}

      <label className="form__field">
        <span>Kode Promo (opsional)</span>
        <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Masukkan kode promo" />
      </label>

      <label className="form__field">
        <span>Catatan (opsional)</span>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan" />
      </label>

      <div className="form__actions">
        <Button variant="ghost" onClick={onCancel}>Batal</Button>
        <Button type="submit" variant="success" loading={submitting}>Selesaikan & Catat</Button>
      </div>
    </form>
  );
}
