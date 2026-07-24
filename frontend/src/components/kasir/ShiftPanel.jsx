import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import { ToggleRight, ToggleLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function ShiftPanel() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openingBalance, setOpeningBalance] = useState('');
  const [openingDigitalBalance, setOpeningDigitalBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [closingDigitalBalance, setClosingDigitalBalance] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCurrentShift = async () => {
    try {
      const data = await api.get('/shifts/current');
      setShift(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentShift();
  }, []);

  const handleOpenShift = async (e) => {
    e.preventDefault();
    if (!openingBalance) return;
    setSubmitting(true);
    try {
      await api.post('/shifts/open', { 
        opening_balance: openingBalance,
        opening_digital_balance: openingDigitalBalance || 0 
      });
      fetchCurrentShift();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal buka shift');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    if (!closingBalance) return;
    setSubmitting(true);
    try {
      const res = await api.post('/shifts/close', { 
        closing_balance: closingBalance,
        closing_digital_balance: closingDigitalBalance || 0 
      });
      alert(
        `Shift ditutup!\n\n` +
        `[KAS FISIK LACI]\nDiharapkan: Rp${Number(res.expected_balance).toLocaleString('id-ID')}\nAktual: Rp${Number(res.closing_balance).toLocaleString('id-ID')}\nSelisih: Rp${Number(res.difference).toLocaleString('id-ID')}\n\n` +
        `[SALDO DIGITAL]\nDiharapkan: Rp${Number(res.expected_digital_balance).toLocaleString('id-ID')}\nAktual: Rp${Number(res.closing_digital_balance).toLocaleString('id-ID')}\nSelisih: Rp${Number(res.digital_difference).toLocaleString('id-ID')}`
      );
      setShift(null);
      setClosingBalance('');
      setClosingDigitalBalance('');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal tutup shift');
    } finally {
      setSubmitting(false);
    }
  };

  const [showForceClose, setShowForceClose] = useState(false);
  const [forceCloseDate, setForceCloseDate] = useState('');
  const [forceCloseTime, setForceCloseTime] = useState('');

  const handleForceClose = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/shifts/force-close', {
        shift_id: shift.id,
        closed_at: `${forceCloseDate} ${forceCloseTime}:00`
      });
      alert('Shift berhasil ditutup paksa');
      setShift(null);
      setShowForceClose(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal tutup paksa shift');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="shift-panel shift-panel--loading">Memuat data shift...</div>;

  return (
    <div className={`shift-panel${shift ? ' shift-panel--active' : ' shift-panel--inactive'}`}>
      <div className="shift-panel__header">
        <span className="shift-panel__icon">{shift ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}</span>
        <h3>Panel Shift</h3>
      </div>
      {!shift ? (
        <form className="form" onSubmit={handleOpenShift}>
          <div className="shift-panel__alert shift-panel__alert--warning">
            Shift belum dibuka. Buka shift dulu untuk mulai transaksi.
          </div>
          <label className="form__field">
            <span>Modal Awal Fisik (Kas di Laci)</span>
            <input
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="Misal: 100000"
              required
            />
          </label>
          <label className="form__field">
            <span>Modal Awal Saldo Digital (Transfer/QRIS)</span>
            <input
              type="number"
              value={openingDigitalBalance}
              onChange={(e) => setOpeningDigitalBalance(e.target.value)}
              placeholder="Misal: 500000"
              required
            />
          </label>
          <Button type="submit" variant="success" fullWidth loading={submitting}>
            Buka Shift
          </Button>
        </form>
      ) : (
        <form className="form" onSubmit={handleCloseShift}>
          <div className="shift-panel__alert shift-panel__alert--success">
            Shift aktif — transaksi siap dicatat.
          </div>
          <p className="shift-panel__info">
            Modal fisik: <strong>Rp{Number(shift.opening_balance).toLocaleString('id-ID')}</strong><br/>
            Modal digital: <strong>Rp{Number(shift.opening_digital_balance).toLocaleString('id-ID')}</strong>
          </p>
          <label className="form__field">
            <span>Hitungan Akhir Kas Fisik (Di Laci)</span>
            <input
              type="number"
              value={closingBalance}
              onChange={(e) => setClosingBalance(e.target.value)}
              placeholder="Hitung uang fisik"
              required
            />
          </label>
          <label className="form__field">
            <span>Hitungan Akhir Saldo Digital (QRIS/Mutasi)</span>
            <input
              type="number"
              value={closingDigitalBalance}
              onChange={(e) => setClosingDigitalBalance(e.target.value)}
              placeholder="Cek mutasi rekening/e-wallet"
              required
            />
          </label>
          <Button type="submit" variant="primary" fullWidth loading={submitting}>
            Tutup Shift
          </Button>

          {isAdmin && (
            <Button 
              type="button" 
              variant="danger" 
              fullWidth 
              style={{ marginTop: '12px' }}
              onClick={() => {
                const now = new Date();
                setForceCloseDate(now.toISOString().split('T')[0]);
                setForceCloseTime(now.toTimeString().split(' ')[0].substring(0, 5));
                setShowForceClose(true);
              }}
            >
              Tutup Paksa (Admin)
            </Button>
          )}
        </form>
      )}

      {showForceClose && (
        <Modal title="Tutup Paksa Shift (Retroaktif)" onClose={() => setShowForceClose(false)}>
          <form className="form" onSubmit={handleForceClose}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.9rem' }}>
              Gunakan fitur ini hanya jika kasir lupa menutup shift. Anda dapat memundurkan waktu penutupan shift ke waktu yang seharusnya agar laporan tidak tercampur.
            </p>
            <label className="form__field">
              <span>Tanggal Tutup</span>
              <input type="date" value={forceCloseDate} onChange={(e) => setForceCloseDate(e.target.value)} required />
            </label>
            <label className="form__field">
              <span>Jam Tutup</span>
              <input type="time" value={forceCloseTime} onChange={(e) => setForceCloseTime(e.target.value)} required />
            </label>
            <Button type="submit" variant="danger" fullWidth loading={submitting}>Konfirmasi Tutup Paksa</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
