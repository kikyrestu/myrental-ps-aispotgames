import { useState, useEffect } from 'react';
import { unitsApi } from '../api/units';
import { consoleTypesApi } from '../api/consoleTypes';
import { api } from '../api/client';
import Button from '../components/shared/Button';

export default function UnitPage() {
  const [units, setUnits] = useState([]);
  const [owners, setOwners] = useState([]);
  const [consoleTypes, setConsoleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ name: '', console_type: '', owner_id: '', commission_rate: 0, notes: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchUnits = async () => {
    try {
      const [data, ownersData, typesData] = await Promise.all([
        unitsApi.list(),
        api.get('/owners').catch(() => []),
        consoleTypesApi.list().catch(() => [])
      ]);
      setUnits(data || []);
      setOwners(ownersData || []);
      setConsoleTypes(typesData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...formData };
    if (!payload.owner_id) {
      delete payload.owner_id;
      payload.commission_rate = 0;
    }
    try {
      if (editingId) {
        await unitsApi.update(editingId, payload);
      } else {
        await unitsApi.create(payload);
      }
      setFormData({ name: '', console_type: '', owner_id: '', commission_rate: 0, notes: '' });
      setEditingId(null);
      fetchUnits();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (unit) => {
    setFormData({
      name: unit.name,
      console_type: unit.console_type,
      owner_id: unit.owner_id || '',
      commission_rate: unit.commission_rate || 0,
      notes: unit.notes || ''
    });
    setEditingId(unit.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus unit ini?')) return;
    try {
      await unitsApi.remove(id);
      fetchUnits();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', console_type: '', owner_id: '', commission_rate: 0, notes: '' });
    setEditingId(null);
  };

  return (
    <div className="fade-in">

      {error && <div className="alert alert--error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div className="promo-layout">
        <div className="promo-form-card">
          <h2>
            {editingId ? 'Edit Unit' : 'Tambah Unit Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="form">
            <label className="form__field">
              <span>Nama Unit (mis: PS4 - TV 1)</span>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </label>

            <label className="form__field">
              <span>Pemilik / Investor (Opsional)</span>
              <select
                value={formData.owner_id || ''}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value ? Number(e.target.value) : '' })}
              >
                <option value="">-- Milik Sendiri --</option>
                {owners.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </label>

            {formData.owner_id && (
              <label className="form__field">
                <span>Persentase Komisi (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: Number(e.target.value) })}
                />
              </label>
            )}

            <label className="form__field">
              <span>Catatan</span>
              <input
                type="text"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </label>
            
            <label className="form__field">
              <span>Tipe Konsol/PC</span>
              <select
                required
                value={formData.console_type}
                onChange={(e) => setFormData({ ...formData, console_type: e.target.value })}
              >
                <option value="" disabled>-- Pilih Tipe --</option>
                {consoleTypes.map(type => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
            </label>

            <div className="form__actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              {editingId && (
                <Button type="button" variant="ghost" onClick={handleCancelEdit} style={{ flex: 1 }}>
                  Batal
                </Button>
              )}
              <Button type="submit" variant="primary" style={{ flex: 1 }}>
                {editingId ? 'Simpan Edit' : 'Tambah Unit'}
              </Button>
            </div>
          </form>
        </div>

        <div className="promo-table-section">
          <h2>Daftar Unit Aktif</h2>
          {loading ? (
            <p>Loading...</p>
          ) : units.length === 0 ? (
            <div className="table-empty">Belum ada unit. Silakan tambah unit baru.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Unit</th>
                    <th>Tipe</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit) => (
                    <tr key={unit.id}>
                      <td data-label="Nama Unit">
                        <div>{unit.name}</div>
                        {unit.owner_name && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            Milik: {unit.owner_name} ({Number(unit.commission_rate)}%)
                          </div>
                        )}
                      </td>
                      <td data-label="Tipe">
                        <span className="badge">{unit.console_type}</span>
                      </td>
                      <td data-label="Status">
                        <span className={`badge ${unit.status === 'kosong' ? 'badge--success' : unit.status === 'dipakai' ? 'badge--primary' : 'badge--warning'}`}>
                          {unit.status}
                        </span>
                      </td>
                      <td data-label="Aksi">
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(unit)}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(unit.id)}>Hapus</Button>
                        </div>
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
