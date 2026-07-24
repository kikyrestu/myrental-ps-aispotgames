import { useState, useEffect } from 'react';
import { api } from '../api/client';
import Button from '../components/shared/Button';

export default function PromoPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    valid_from: '',
    valid_until: '',
  });

  const fetchPromos = async () => {
    try {
      const data = await api.get('/promos');
      setPromos(data);
    } catch (err) {
      alert('Gagal mengambil data promo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/promos', formData);
      setFormData({ code: '', description: '', type: 'percentage', value: '', valid_from: '', valid_until: '' });
      fetchPromos();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambah promo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus promo ini?')) return;
    try {
      await api.delete(`/promos/${id}`);
      fetchPromos();
    } catch (err) {
      alert('Gagal menghapus promo');
    }
  };

  if (loading) return <div className="app-loading">Memuat...</div>;

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>Manajemen Promo</h1>
          <p className="page__subtitle">Buat dan kelola kode promo / diskon</p>
        </div>
      </header>

      <div className="promo-layout">
        {/* Form tambah promo */}
        <div className="promo-form-card">
          <h2>Tambah Promo Baru</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label className="form__field">
              <span>Kode Promo</span>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Misal: MABAR5K"
                required
              />
            </label>

            <label className="form__field">
              <span>Deskripsi (Opsional)</span>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Diskon hari libur"
              />
            </label>

            <div className="form__toggle">
              <button
                type="button"
                className={formData.type === 'percentage' ? 'is-active' : ''}
                onClick={() => setFormData({ ...formData, type: 'percentage' })}
              >
                Persentase (%)
              </button>
              <button
                type="button"
                className={formData.type === 'fixed' ? 'is-active' : ''}
                onClick={() => setFormData({ ...formData, type: 'fixed' })}
              >
                Nominal (Rp)
              </button>
            </div>

            <label className="form__field">
              <span>Nilai Diskon {formData.type === 'percentage' ? '(%)' : '(Rp)'}</span>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={formData.type === 'percentage' ? '10' : '5000'}
                required
              />
            </label>

            <label className="form__field">
              <span>Berlaku Dari (Opsional)</span>
              <input
                type="datetime-local"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
              />
            </label>

            <label className="form__field">
              <span>Berlaku Sampai (Opsional)</span>
              <input
                type="datetime-local"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              />
            </label>

            <div className="form__actions">
              <Button type="submit" variant="primary" fullWidth loading={submitting}>
                Simpan Promo
              </Button>
            </div>
          </form>
        </div>

        {/* Tabel daftar promo */}
        <div className="promo-table-section">
          <h2>Daftar Promo Aktif</h2>
          {promos.length === 0 ? (
            <div className="table-empty">Belum ada promo. Buat promo baru di form sebelah kiri.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Tipe</th>
                    <th>Nilai</th>
                    <th>Deskripsi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((p) => (
                    <tr key={p.id}>
                      <td data-label="Kode"><span className="promo-code-badge">{p.code}</span></td>
                      <td data-label="Tipe">{p.type === 'percentage' ? 'Persen' : 'Nominal'}</td>
                      <td data-label="Nilai">
                        {p.type === 'percentage'
                          ? `${Number(p.value)}%`
                          : `Rp${Number(p.value).toLocaleString('id-ID')}`}
                      </td>
                      <td data-label="Deskripsi">{p.description || <span className="text-muted">—</span>}</td>
                      <td data-label="Aksi">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                          Hapus
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
    </div>
  );
}
