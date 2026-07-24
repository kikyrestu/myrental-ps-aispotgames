import { useState, useEffect } from 'react';
import { api } from '../api/client';
import Button from '../components/shared/Button';

export default function CommissionPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [details, setDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchReports = async () => {
    try {
      const data = await api.get('/commissions');
      setReports(data);
    } catch (err) {
      alert('Gagal mengambil data komisi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchDetails = async (ownerId) => {
    setSelectedOwner(ownerId);
    setDetailsLoading(true);
    try {
      const data = await api.get(`/commissions/${ownerId}?status=all`);
      setDetails(data);
    } catch (err) {
      alert('Gagal mengambil detail komisi');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handlePay = async (ownerId, amount) => {
    if (!window.confirm(`Bayar lunas tagihan komisi sebesar Rp${amount.toLocaleString('id-ID')}?`)) return;
    try {
      await api.post(`/commissions/${ownerId}/pay`);
      fetchReports();
      if (selectedOwner === ownerId) {
        fetchDetails(ownerId);
      }
    } catch (err) {
      alert(err.message || 'Gagal memproses pembayaran');
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>Laporan Komisi</h1>
          <p className="page__subtitle">Bagi hasil untuk unit konsinyasi</p>
        </div>
      </header>

      {loading ? (
        <p>Memuat data...</p>
      ) : (
        <div className="table-wrap" style={{ marginBottom: 32 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Investor</th>
                <th>Sesi Selesai</th>
                <th>Total Belum Dibayar</th>
                <th>Total Sudah Dibayar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.owner_id} className={Number(r.unpaid_amount) > 0 ? 'row-highlight' : ''}>
                  <td data-label="Investor">
                    <strong>{r.owner_name}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.bank_account}</div>
                  </td>
                  <td data-label="Sesi">{r.total_sessions} sesi</td>
                  <td data-label="Belum Dibayar" style={{ color: Number(r.unpaid_amount) > 0 ? 'var(--warning)' : 'inherit' }}>
                    Rp{Number(r.unpaid_amount).toLocaleString('id-ID')}
                  </td>
                  <td data-label="Sudah Dibayar">Rp{Number(r.paid_amount).toLocaleString('id-ID')}</td>
                  <td data-label="Aksi">
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm" onClick={() => fetchDetails(r.owner_id)}>Detail</Button>
                      {Number(r.unpaid_amount) > 0 && (
                        <Button variant="success" size="sm" onClick={() => handlePay(r.owner_id, Number(r.unpaid_amount))}>
                          Bayar Lunas
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Belum ada data komisi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedOwner && (
        <div className="card" style={{ padding: 24 }}>
          <h3>Detail Sesi Investor</h3>
          {detailsLoading ? (
            <p>Memuat detail...</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Waktu Selesai</th>
                    <th>Unit</th>
                    <th>Durasi</th>
                    <th>Komisi</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((d) => (
                    <tr key={d.id}>
                      <td data-label="Waktu Selesai">{new Date(d.created_at).toLocaleString('id-ID')}</td>
                      <td data-label="Unit">{d.unit_name}</td>
                      <td data-label="Durasi">{d.duration_minutes} menit</td>
                      <td data-label="Komisi">Rp{Number(d.amount).toLocaleString('id-ID')}</td>
                      <td data-label="Status">
                        <span className={`badge ${d.status === 'paid' ? 'badge--success' : 'badge--warning'}`}>
                          {d.status === 'paid' ? 'Lunas' : 'Belum Dibayar'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {details.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>Tidak ada detail.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
