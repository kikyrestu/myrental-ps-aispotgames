import { useState, useMemo } from 'react';
import { api } from '../api/client';
import { usePolling } from '../hooks/usePolling';
import { formatRupiah } from '../utils/format';
import { DollarSign, MonitorPlay, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';

export default function MitraDashboardPage() {
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  
  const [filterType, setFilterType] = useState('month'); // default month
  const [customStart, setCustomStart] = useState(today);
  const [customEnd, setCustomEnd] = useState(today);

  const dateParams = useMemo(() => {
    if (filterType === 'today') return { start_date: today, end_date: today };
    if (filterType === 'week') {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(d.setDate(diff)).toISOString().slice(0, 10);
      return { start_date: start, end_date: today };
    }
    if (filterType === 'month') {
      const start = today.slice(0, 8) + '01';
      return { start_date: start, end_date: today };
    }
    return { start_date: customStart || today, end_date: customEnd || today };
  }, [filterType, customStart, customEnd, today]);

  const { data: dm } = usePolling(
    () => {
      const q = new URLSearchParams(dateParams).toString();
      return api.get(`/mitra/dashboard?${q}`);
    },
    10000,
    [dateParams]
  );

  const stats = dm || {
    unpaid_commission: 0,
    paid_commission: 0,
    estimated_commission: 0,
    unit_performance: [],
    recent_commissions: [],
    recent_payouts: []
  };

  return (
    <div className="page">
      <header className="page__header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Portal Mitra</h1>
          <p className="page__subtitle" style={{ color: 'var(--text-muted)' }}>
            Selamat datang, {user?.full_name}! Berikut ringkasan pendapatan dari unit Anda.
          </p>
        </div>
      </header>

      {/* FILTER PANEL */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-card)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <button 
          className={`btn btn--sm ${filterType === 'today' ? 'btn--primary' : 'btn--ghost'}`} 
          onClick={() => setFilterType('today')}
        >
          Hari Ini
        </button>
        <button 
          className={`btn btn--sm ${filterType === 'week' ? 'btn--primary' : 'btn--ghost'}`} 
          onClick={() => setFilterType('week')}
        >
          Minggu Ini
        </button>
        <button 
          className={`btn btn--sm ${filterType === 'month' ? 'btn--primary' : 'btn--ghost'}`} 
          onClick={() => setFilterType('month')}
        >
          Bulan Ini
        </button>
        <button 
          className={`btn btn--sm ${filterType === 'custom' ? 'btn--primary' : 'btn--ghost'}`} 
          onClick={() => setFilterType('custom')}
        >
          Custom Date
        </button>
        
        {filterType === 'custom' && (
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
            <input 
              type="date" 
              value={customStart} 
              onChange={(e) => setCustomStart(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
            />
            <span> - </span>
            <input 
              type="date" 
              value={customEnd} 
              onChange={(e) => setCustomEnd(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
            />
          </div>
        )}
      </div>

      {/* QUICK STATS */}
      <div className="dash-grid" style={{ marginBottom: '24px' }}>
        <div className="responsive-grid" style={{ width: '100%' }}>
          
          <div className="dash-stat-card" style={{ borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.05)', padding: '32px' }}>
            <div className="dash-stat-icon" style={{ background: '#f59e0b', width: '72px', height: '72px' }}>
              <Clock style={{ width: '40px', height: '40px' }} />
            </div>
            <div className="dash-stat-content">
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Komisi Belum Dibayar</h4>
              <h2 style={{ color: '#f59e0b', fontSize: '36px' }}>{formatRupiah(stats.unpaid_commission)}</h2>
            </div>
          </div>
          
          <div className="dash-stat-card" style={{ borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.05)', padding: '32px' }}>
            <div className="dash-stat-icon" style={{ background: '#10b981', width: '72px', height: '72px' }}>
              <CheckCircle style={{ width: '40px', height: '40px' }} />
            </div>
            <div className="dash-stat-content">
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Komisi Sudah Dibayar</h4>
              <h2 style={{ color: '#10b981', fontSize: '36px' }}>{formatRupiah(stats.paid_commission)}</h2>
            </div>
          </div>
          
          <div className="dash-stat-card" style={{ borderColor: '#3b82f6', background: 'rgba(59, 130, 246, 0.05)', padding: '32px' }}>
            <div className="dash-stat-icon" style={{ background: '#3b82f6', width: '72px', height: '72px' }}>
              <DollarSign style={{ width: '40px', height: '40px' }} />
            </div>
            <div className="dash-stat-content">
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Total Komisi Terkumpul</h4>
              <h2 style={{ color: '#3b82f6', fontSize: '36px' }}>{formatRupiah(stats.estimated_commission)}</h2>
            </div>
          </div>

        </div>
      </div>

      <div className="responsive-grid" style={{ marginBottom: '24px' }}>
        
        {/* PERFORMA UNIT */}
        <div className="dash-panel">
          <h3>Performa Unit PS</h3>
          {stats.unit_performance.length > 0 ? (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Total Sesi</th>
                    <th>Total Komisi</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.unit_performance.map((up, idx) => (
                    <tr key={idx}>
                      <td><strong style={{ color: 'var(--accent)' }}>{up.name}</strong></td>
                      <td>{up.total_sessions} Sesi</td>
                      <td style={{ color: 'var(--success)' }}>{formatRupiah(up.total_commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Belum ada data performa.</p>
          )}
        </div>

        {/* RECENT PAYOUTS */}
        <div className="dash-panel">
          <h3>Riwayat Pencairan Komisi (Payout)</h3>
          {stats.recent_payouts.length > 0 ? (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tanggal Cair</th>
                    <th>Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_payouts.map((po, idx) => (
                    <tr key={idx}>
                      <td>{new Date(po.paid_at).toLocaleString('id-ID')}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{formatRupiah(po.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Belum ada riwayat pencairan.</p>
          )}
        </div>

      </div>

      {/* RECENT COMMISSIONS TABLE */}
      <div className="dash-panel">
        <h3>Riwayat Sesi Rental Terbaru (10 Terakhir)</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Unit</th>
                <th>Durasi</th>
                <th>Komisi</th>
                <th>Status Bayar</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_commissions.length > 0 ? (
                stats.recent_commissions.map((rc, idx) => (
                  <tr key={idx}>
                    <td>{new Date(rc.created_at).toLocaleString('id-ID')}</td>
                    <td>{rc.unit_name}</td>
                    <td>{rc.duration_minutes} mnt</td>
                    <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{formatRupiah(rc.amount)}</td>
                    <td>
                      {rc.status === 'paid' ? (
                        <span className="badge badge--success">Sudah Dibayar</span>
                      ) : (
                        <span className="badge badge--warning">Belum Dibayar</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    Belum ada riwayat komisi rental.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
