import { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { api } from '../api/client';
import { consoleTypesApi } from '../api/consoleTypes';
import { formatRupiah } from '../utils/format';
import Table from '../components/shared/Table';
import Modal from '../components/shared/Modal';

export default function PackagePage() {
  const [packages, setPackages] = useState([]);
  const [consoleTypes, setConsoleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type: 'add'|'edit', data?: {} }
  const [formData, setFormData] = useState({ name: '', duration_minutes: 60, price: 0, console_type: 'Semua', is_active: 1 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pkgRes, typeRes] = await Promise.all([
        api.get('/packages'),
        consoleTypesApi.list().catch(() => [])
      ]);
      setPackages(pkgRes || []);
      setConsoleTypes(typeRes || []);
    } catch (err) {
      alert('Gagal mengambil data paket atau unit');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, data = null) => {
    setModal({ type, data });
    if (data) {
      setFormData({ 
        name: data.name, 
        duration_minutes: data.duration_minutes, 
        price: data.price || 0,
        console_type: data.console_type || 'Semua',
        is_active: data.is_active
      });
    } else {
      setFormData({ name: '', duration_minutes: 60, price: 0, console_type: 'Semua', is_active: 1 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modal.type === 'add') {
        await api.post('/packages', formData);
      } else {
        await api.put(`/packages/${modal.data.id}`, formData);
      }
      setModal(null);
      fetchData();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan paket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus paket ini?')) return;
    try {
      await api.delete(`/packages/${id}`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Gagal menghapus paket');
    }
  };

  const columns = [
    { key: 'name', label: 'Nama Paket' },
    { key: 'console_type', label: 'Tipe Unit/Console', render: (r) => <span className="unit-card__badge">{r.console_type || 'Semua'}</span> },
    { key: 'duration_minutes', label: 'Durasi', render: (r) => `${r.duration_minutes} Menit (${r.duration_minutes / 60} Jam)` },
    { key: 'price', label: 'Harga Tarif (Rp)', render: (r) => formatRupiah(r.price) },
    { key: 'is_active', label: 'Status', render: (r) => r.is_active ? 'Aktif' : 'Nonaktif' },
    {
      key: 'actions',
      label: 'Aksi',
      render: (r) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn--sm btn--ghost" onClick={() => handleOpenModal('edit', r)}>Edit</button>
          <button className="btn btn--sm btn--ghost" style={{ color: 'var(--critical)' }} onClick={() => handleDelete(r.id)}>Hapus</button>
        </div>
      )
    }
  ];

  return (
    <div className="fade-in">
      <button className="btn btn--primary" onClick={() => handleOpenModal('add')}>+ Tambah Paket</button>

      {loading ? <p>Memuat...</p> : <Table columns={columns} rows={packages} emptyMessage="Belum ada data paket" />}

      {modal && (
        <Modal title={modal.type === 'add' ? 'Tambah Paket Baru' : 'Edit Paket'} onClose={() => setModal(null)}>
          <form className="form" onSubmit={handleSubmit}>
            <label className="form__field">
              Nama Paket
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Contoh: Paket 1 Jam"
              />
            </label>
          <div className="form-row">
              <label className="form__field" style={{ flex: 1 }}>
                Durasi (Menit)
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={formData.duration_minutes} 
                  onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})}
                />
              </label>
              <label className="form__field" style={{ flex: 1 }}>
                Harga Tarif (Rp)
                <input 
                  type="number" 
                  required 
                  min="0"
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                />
              </label>
            </div>
            <label className="form__field">
              Tipe Unit / Console
              <select 
                value={formData.console_type} 
                onChange={e => setFormData({...formData, console_type: e.target.value})}
              >
                <option value="Semua">Semua Unit (Universal)</option>
                {consoleTypes.map(type => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
            </label>
            <p className="form__hint" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              <Lightbulb size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Paket hanya akan muncul di Kasir jika kasir memilih Unit dengan Tipe Console yang sesuai.
            </p>
            <label className="form__field">
              Status Aktif
              <select 
                value={formData.is_active} 
                onChange={e => setFormData({...formData, is_active: Number(e.target.value)})}
              >
                <option value={1}>Aktif (Muncul di Kasir)</option>
                <option value={0}>Nonaktif (Disembunyikan)</option>
              </select>
            </label>
            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setModal(null)}>Batal</button>
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
