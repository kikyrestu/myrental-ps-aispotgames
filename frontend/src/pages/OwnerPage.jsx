import { useState, useEffect } from 'react';
import { api } from '../api/client';
import Button from '../components/shared/Button';

export default function OwnerPage() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchOwners = async () => {
    try {
      const data = await api.get('/owners');
      setOwners(data);
    } catch (err) {
      alert('Gagal mengambil data investor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (form.id) {
        await api.put(`/owners/${form.id}`, form);
      } else {
        await api.post('/owners', form);
      }
      setForm(null);
      fetchOwners();
    } catch (err) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus investor ini?')) return;
    try {
      await api.delete(`/owners/${id}`);
      fetchOwners();
    } catch (err) {
      alert(err.message || 'Gagal menghapus');
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>Manajemen Investor</h1>
          <p className="page__subtitle">Atur data pemilik unit dan akses login-nya</p>
        </div>
        <Button onClick={() => setForm({ name: '', phone: '', bank_account: '', username: '', password: '' })}>
          Tambah Investor
        </Button>
      </header>

      {form && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 24, padding: 24 }}>
          <h3>{form.id ? 'Edit Investor' : 'Tambah Investor'}</h3>
          <div className="form__group">
            <label className="form__field">
              <span>Nama Lengkap</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="form__field">
              <span>Nomor HP</span>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label className="form__field">
              <span>Rekening Bank</span>
              <input
                placeholder="BCA 123456 a.n Budi"
                value={form.bank_account || ''}
                onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
              />
            </label>
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
              <h4 style={{ marginBottom: 12 }}>Akses Login Portal Mitra</h4>
              <label className="form__field">
                <span>Username</span>
                <input
                  placeholder="Kosongkan jika tidak butuh akses login"
                  value={form.username || ''}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </label>
              <label className="form__field">
                <span>Password</span>
                <input
                  type="password"
                  placeholder={form.id ? "Isi hanya jika ingin ganti password" : "Wajib diisi jika membuat username"}
                  value={form.password || ''}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <Button type="submit" disabled={submitting}>Simpan</Button>
            <Button variant="ghost" onClick={() => setForm(null)}>Batal</Button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Memuat data...</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Nomor HP</th>
                <th>Rekening</th>
                <th>Akun Login</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((o) => (
                <tr key={o.id}>
                  <td data-label="Nama">{o.name}</td>
                  <td data-label="Nomor HP">{o.phone || '-'}</td>
                  <td data-label="Rekening">{o.bank_account || '-'}</td>
                  <td data-label="Akun Login">
                    {o.username ? (
                      <span className="badge badge--success">{o.username}</span>
                    ) : (
                      <span className="badge badge--warning">Belum Ada</span>
                    )}
                  </td>
                  <td data-label="Aksi">
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm" onClick={() => setForm(o)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(o.id)}>Hapus</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {owners.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>Belum ada data investor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
