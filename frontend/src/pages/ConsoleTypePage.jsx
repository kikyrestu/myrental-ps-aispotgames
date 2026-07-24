import { useState, useEffect } from 'react';
import { consoleTypesApi } from '../api/consoleTypes';
import Button from '../components/shared/Button';

export default function ConsoleTypePage() {
  const [consoleTypes, setConsoleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchConsoleTypes = async () => {
    try {
      setLoading(true);
      const data = await consoleTypesApi.list();
      setConsoleTypes(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsoleTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await consoleTypesApi.update(editingId, formData);
      } else {
        await consoleTypesApi.create(formData);
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      fetchConsoleTypes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description || ''
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus tipe konsol ini?')) return;
    try {
      await consoleTypesApi.remove(id);
      fetchConsoleTypes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
  };

  return (
    <div className="fade-in">
      {error && <div className="alert alert--error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div className="promo-layout">
        <div className="promo-form-card">
          <h2>
            {editingId ? 'Edit Tipe Konsol' : 'Tambah Tipe Konsol'}
          </h2>
          <form onSubmit={handleSubmit} className="form">
            <label className="form__field">
              <span>Nama Tipe Konsol (mis: PS5)</span>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              />
            </label>

            <label className="form__field">
              <span>Deskripsi (Opsional)</span>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Misal: PlayStation 5"
              />
            </label>

            <div className="form__actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              {editingId && (
                <Button type="button" variant="ghost" onClick={handleCancelEdit} style={{ flex: 1 }}>
                  Batal
                </Button>
              )}
              <Button type="submit" variant="primary" style={{ flex: 1 }}>
                {editingId ? 'Simpan Edit' : 'Tambah Tipe'}
              </Button>
            </div>
          </form>
        </div>

        <div className="promo-table-section">
          <h2>Daftar Tipe Konsol</h2>
          {loading ? (
            <p>Loading...</p>
          ) : consoleTypes.length === 0 ? (
            <div className="table-empty">Belum ada tipe konsol.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Deskripsi</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {consoleTypes.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Nama">
                        <span className="badge">{item.name}</span>
                      </td>
                      <td data-label="Deskripsi">{item.description || '-'}</td>
                      <td data-label="Aksi" style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Hapus</Button>
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
