import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { membersApi } from '../api/members';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';

export default function MemberPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', phone: '', time_balance: '', amount: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Manual Time Balance Modal state
  const [timeModalMember, setTimeModalMember] = useState(null);
  const [timeInput, setTimeInput] = useState('');
  const [timeAmount, setTimeAmount] = useState('');
  const [timeSubmitting, setTimeSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      const data = await api.get('/members');
      setMembers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await api.post('/members', {
        ...formData,
        time_balance: parseInt(formData.time_balance) || 0,
        amount: parseFloat(formData.amount) || 0
      });
      setFormData({ name: '', phone: '', time_balance: '', amount: '' });
      setSuccessMsg('Member berhasil didaftarkan!');
      fetchMembers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenTimeModal = (member) => {
    setTimeModalMember(member);
    setTimeInput('');
    setTimeAmount('');
    setError('');
    setSuccessMsg('');
  };

  const handleSubmitTime = async (e) => {
    e.preventDefault();
    if (!timeModalMember || !timeInput || parseInt(timeInput) === 0) return;
    setTimeSubmitting(true);
    setError('');
    try {
      await membersApi.addTime(timeModalMember.id, parseInt(timeInput), parseFloat(timeAmount) || 0);
      setSuccessMsg(`Saldo waktu ${timeModalMember.name} berhasil diperbarui!`);
      setTimeModalMember(null);
      fetchMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      {error && <div className="alert alert--error" style={{ marginBottom: '16px' }}>{error}</div>}
      {successMsg && <div className="alert alert--success" style={{ marginBottom: '16px' }}>{successMsg}</div>}

      <div className="promo-layout">
        <div className="promo-form-card">
          <h2>Tambah Member</h2>
          <form onSubmit={handleSubmit} className="form">
            <label className="form__field">
              <span>Nama Lengkap</span>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </label>
            <label className="form__field">
              <span>Nomor HP</span>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </label>
            <label className="form__field">
              <span>Saldo Waktu Awal (Menit)</span>
              <input
                type="number"
                placeholder="0"
                value={formData.time_balance}
                onChange={(e) => setFormData({ ...formData, time_balance: e.target.value })}
              />
            </label>
            <label className="form__field">
              <span>Nominal Uang Bayar (Opsional, Rp)</span>
              <input
                type="number"
                placeholder="0 (jika berbayar)"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </label>
            <div className="form__actions">
              <Button type="submit" variant="primary" fullWidth>
                Daftar Member
              </Button>
            </div>
          </form>
        </div>

        <div className="promo-table-section">
          <h2>Daftar Member</h2>
          {loading ? (
            <p>Loading...</p>
          ) : members.length === 0 ? (
            <div className="table-empty">Belum ada member yang terdaftar</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>No. HP</th>
                    <th>Saldo Waktu</th>
                    <th>Poin</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td data-label="Nama">{m.name}</td>
                      <td data-label="Nomor HP">{m.phone || '-'}</td>
                      <td data-label="Deposit Waktu">
                        <span className="badge badge--success">{m.time_balance || 0} menit</span>
                      </td>
                      <td data-label="Poin">{m.points || 0}</td>
                      <td data-label="Aksi">
                        <Button variant="primary" size="sm" onClick={() => handleOpenTimeModal(m)}>
                          + / - Saldo Waktu
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {timeModalMember && (
        <Modal
          title={`Kelola Saldo Waktu: ${timeModalMember.name}`}
          onClose={() => setTimeModalMember(null)}
        >
          <form onSubmit={handleSubmitTime} className="form">
            <div style={{ marginBottom: 16, padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: 14 }}>
                Saldo Waktu Saat Ini: <strong style={{ color: 'var(--success)' }}>{timeModalMember.time_balance || 0} Menit</strong>
              </p>
            </div>
            <label className="form__field">
              <span>Tambah / Kurangi Menit (Ketik angka minus misal -30 untuk mengurangi)</span>
              <input
                type="number"
                required
                placeholder="Contoh: 60 (tambah 1 jam) atau -30 (kurangi 30 menit)"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                autoFocus
              />
            </label>
            <label className="form__field">
              <span>Nominal Uang Bayar Top-up (Opsional, Rp)</span>
              <input
                type="number"
                placeholder="0 (Jika gratis / tidak ada uang masuk kas)"
                value={timeAmount}
                onChange={(e) => setTimeAmount(e.target.value)}
              />
            </label>
            <div className="form__actions" style={{ marginTop: 20, display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button type="button" variant="ghost" onClick={() => setTimeModalMember(null)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={timeSubmitting}>
                {timeSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
