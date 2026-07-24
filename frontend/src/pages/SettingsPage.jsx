import { useState, useEffect } from 'react';
import { settingsApi } from '../api/settings';
import Button from '../components/shared/Button';

export default function SettingsPage() {
  const [settings, setSettings] = useState({ shift_start_time: '', shift_end_time: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsApi.get();
      setSettings({
        shift_start_time: data.shift_start_time || '09:00',
        shift_end_time: data.shift_end_time || '23:00'
      });
    } catch (err) {
      console.error(err);
      showToast('Gagal mengambil pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await settingsApi.update(settings);
      showToast('Pengaturan berhasil disimpan');
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '20px', color: 'var(--text-muted)' }}>Memuat pengaturan...</div>;

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>Pengaturan Shift & Operasional</h2>
      <form onSubmit={handleSubmit} className="form" style={{ maxWidth: '400px' }}>
        <div className="form__field">
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Jam Pengingat Buka Shift</label>
          <input 
            type="time" 
            value={settings.shift_start_time} 
            onChange={e => setSettings({...settings, shift_start_time: e.target.value})} 
            required
            className="input"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
          />
          <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Pop-up peringatan akan muncul jika sudah lewat jam ini tapi shift belum dibuka.
          </small>
        </div>

        <div className="form__field" style={{ marginTop: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Jam Otomatis Tutup Shift</label>
          <input 
            type="time" 
            value={settings.shift_end_time} 
            onChange={e => setSettings({...settings, shift_end_time: e.target.value})} 
            required
            className="input"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
          />
          <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Jika kasir lupa tutup shift, sistem akan otomatis menutupnya setelah jam ini.
          </small>
        </div>

        <div style={{ marginTop: '24px' }}>
          <Button type="submit" variant="primary" loading={submitting}>Simpan Pengaturan</Button>
        </div>
      </form>

      {toast && (
        <div className="toast" style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: 'var(--bg-card)', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderLeft: '4px solid var(--primary)', zIndex: 9999 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
