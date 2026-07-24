import { useState, useEffect } from 'react';
import { api } from '../api/client';
import Button from '../components/shared/Button';

export default function MemberPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [error, setError] = useState('');

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
    try {
      await api.post('/members', formData);
      setFormData({ name: '', phone: '' });
      fetchMembers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fade-in">

      {error && <div className="alert alert--error" style={{ marginBottom: '16px' }}>{error}</div>}

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
                      <td data-label="Aksi">
                        <Button variant="danger" size="sm" onClick={() => handleDelete(m.id)}>Hapus</Button>
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
