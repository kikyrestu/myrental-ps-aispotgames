import { useState, useEffect } from 'react';
import Button from '../shared/Button';
import { api } from '../../api/client';

export default function SessionForm({ unit, packages, onSubmit, onCancel, submitting }) {
  const [mode, setMode] = useState('package'); // 'package' | 'custom'
  const [packageId, setPackageId] = useState(packages[0]?.id ?? '');
  const [customMinutes, setCustomMinutes] = useState(60);
  const [customerName, setCustomerName] = useState('');
  const [sessionType, setSessionType] = useState('walkin');
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState('');

  useEffect(() => {
    api.get('/members').then(data => setMembers(data || [])).catch(console.error);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      unit_id: unit.id,
      customer_name: customerName || null,
      session_type: sessionType,
      member_id: memberId ? Number(memberId) : null,
    };
    if (mode === 'package') {
      payload.package_id = Number(packageId);
    } else {
      payload.duration_minutes = Number(customMinutes);
    }
    onSubmit(payload);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <p className="form__hint">Unit: <strong>{unit.name}</strong></p>

      <label className="form__field">
        <span>Pilih Member (opsional)</span>
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
          <option value="">- Bukan Member -</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
          ))}
        </select>
      </label>

      {!memberId && (
        <label className="form__field">
          <span>Nama pelanggan (opsional)</span>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in" />
        </label>
      )}

      <label className="form__field">
        <span>Tipe sesi</span>
        <select value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
          <option value="walkin">Walk-in</option>
          <option value="booking">Booking</option>
        </select>
      </label>

      <div className="form__field">
        <span>Durasi</span>
        <div className="form__toggle">
          <button type="button" className={mode === 'package' ? 'is-active' : ''} onClick={() => setMode('package')}>
            Paket
          </button>
          <button type="button" className={mode === 'custom' ? 'is-active' : ''} onClick={() => setMode('custom')}>
            Custom
          </button>
        </div>
      </div>

      {mode === 'package' ? (
        <label className="form__field">
          <span>Pilih paket</span>
          <select value={packageId} onChange={(e) => setPackageId(e.target.value)}>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name} — Rp{Number(pkg.price).toLocaleString('id-ID')}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="form__field">
          <span>Durasi custom (menit)</span>
          <input
            type="number"
            min={1}
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
          />
        </label>
      )}

      <div className="form__actions">
        <Button variant="ghost" onClick={onCancel}>Batal</Button>
        <Button type="submit" variant="primary" loading={submitting}>Mulai Sesi</Button>
      </div>
    </form>
  );
}
