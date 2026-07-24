import { useMemo, useState, useEffect } from 'react';
import { usePolling } from '../hooks/usePolling';
import { useTimerAnnouncement, speak } from '../hooks/useTimerAnnouncement';
import { unitsApi } from '../api/units';
import { sessionsApi } from '../api/sessions';
import { packagesApi } from '../api/transactions';
import { api } from '../api/client';
import UnitCard from '../components/dashboard/UnitCard';
import AlertBanner from '../components/dashboard/AlertBanner';
import Modal from '../components/shared/Modal';
import SessionForm from '../components/kasir/SessionForm';
import PaymentForm from '../components/kasir/PaymentForm';
import { useAuth } from '../hooks/useAuth';

// Chart components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, MonitorPlay, Users, ShoppingCart, Monitor, Bell, Activity, Volume2, ToggleRight, ToggleLeft } from 'lucide-react';
import { formatRupiah } from '../utils/format';

const VOICE_PREF_KEY = 'rental-ps:voice-enabled';

export default function DashboardPage() {
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);

  const [filterType, setFilterType] = useState('today'); // today, week, month, custom
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

  const { data: units, refetch: refetchUnits } = usePolling(() => unitsApi.list(), 4000);
  const { data: ongoingSessions, refetch: refetchSessions } = usePolling(
    () => sessionsApi.list('ongoing'),
    4000
  );
  const { data: packages } = usePolling(() => packagesApi.list(), 60000);
  
  const { data: dashMetrics } = usePolling(
    () => {
      const q = new URLSearchParams(dateParams).toString();
      return api.get(`/reports/dashboard?${q}`);
    },
    5000,
    [dateParams]
  );

  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(
    () => localStorage.getItem(VOICE_PREF_KEY) !== 'off'
  );

  useEffect(() => {
    localStorage.setItem(VOICE_PREF_KEY, voiceEnabled ? 'on' : 'off');
  }, [voiceEnabled]);

  useTimerAnnouncement(ongoingSessions, voiceEnabled);

  const sessionByUnit = useMemo(() => {
    const map = {};
    (ongoingSessions || []).forEach((s) => (map[s.unit_id] = s));
    return map;
  }, [ongoingSessions]);

  const refreshAll = () => {
    refetchUnits();
    refetchSessions();
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleStartSession = async (payload) => {
    setSubmitting(true);
    try {
      await sessionsApi.start(payload);
      setModal(null);
      refreshAll();
      showToast('Sesi dimulai');
    } catch (err) {
      showToast(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSession = async ({ paymentMethod, promo_code, notes, save_time }) => {
    setSubmitting(true);
    try {
      await sessionsApi.complete(modal.session.id, paymentMethod, notes, promo_code, save_time);
      setModal(null);
      refreshAll();
      showToast('Sesi selesai & tercatat');
    } catch (err) {
      showToast(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMaintenance = async (unit) => {
    const next = unit.status === 'maintenance' ? 'kosong' : 'maintenance';
    await unitsApi.updateStatus(unit.id, next);
    refreshAll();
  };

  // --- DERIVED DATA ---
  const safeUnits = units || [];
  const safeSessions = ongoingSessions || [];
  
  const activeSessionsCount = safeSessions.length;
  const activeCustomers = activeSessionsCount; 
  
  // Dash Metrics fallback
  const dm = dashMetrics || {
    ps_revenue: 0,
    fb_revenue: 0,
    gross_revenue: 0,
    total_expense: 0,
    net_revenue: 0,
    expense_details: []
  };
  
  const unitInUse = safeUnits.filter(u => u.status === 'dipakai').length;
  const unitReady = safeUnits.filter(u => u.status === 'kosong').length;
  const unitMaintenance = safeUnits.filter(u => u.status === 'maintenance').length;
  const unitTotal = safeUnits.length;

  const donutData = [
    { name: 'Digunakan', value: unitInUse, color: '#2e72f8' },
    { name: 'Siap', value: unitReady, color: '#10b981' },
    { name: 'Maintenance', value: unitMaintenance, color: '#f59e0b' },
  ];

  const chartData = dm.chart_data || [];

  return (
    <div className="page">
      <header className="page__header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Dashboard</h1>
          <p className="page__subtitle" style={{ color: 'var(--text-muted)' }}>Ringkasan aktivitas sistem hari ini</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => speak('Tes suara. Satu dua tiga dicoba.')}
            title="Tes apakah suara keluar di speaker"
            style={{ padding: '8px 12px', background: 'var(--surface-alt)' }}
          >
            <Volume2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Cek Suara
          </button>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setVoiceEnabled((v) => !v)}
            title="Nyala/matiin voice announcement sisa waktu"
            style={{ padding: '8px 12px', background: 'var(--surface-alt)', color: voiceEnabled ? 'var(--success)' : 'var(--critical)' }}
          >
            {voiceEnabled ? <><ToggleRight size={16} /> Suara aktif</> : <><ToggleLeft size={16} /> Suara mati</>}
          </button>
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

      <AlertBanner sessions={ongoingSessions} />
      {toast && <div className="toast">{toast}</div>}

      <div className="dash-grid">
        {/* ROW 1: QUICK STATS */}
        {/* HERO STATS: SHIFT BALANCES (REAL-TIME) */}
        <div className="responsive-grid" style={{ marginBottom: '20px' }}>
          <div className="dash-stat-card" style={{ borderColor: '#3b82f6', background: 'rgba(59, 130, 246, 0.05)', padding: '32px' }}>
            <div className="dash-stat-icon" style={{ background: '#3b82f6', width: '72px', height: '72px' }}>
              <DollarSign style={{ width: '40px', height: '40px' }} />
            </div>
            <div className="dash-stat-content">
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Estimasi Kas Fisik Laci</h4>
              <h2 style={{ color: '#3b82f6', fontSize: '36px' }}>{formatRupiah(dm.current_expected_cash || 0)}</h2>
            </div>
          </div>
          <div className="dash-stat-card" style={{ borderColor: '#8b5cf6', background: 'rgba(139, 92, 246, 0.05)', padding: '32px' }}>
            <div className="dash-stat-icon" style={{ background: '#8b5cf6', width: '72px', height: '72px' }}>
              <Activity style={{ width: '40px', height: '40px' }} />
            </div>
            <div className="dash-stat-content">
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Estimasi Saldo Digital</h4>
              <h2 style={{ color: '#8b5cf6', fontSize: '36px' }}>{formatRupiah(dm.current_expected_digital || 0)}</h2>
            </div>
          </div>
        </div>

        {/* ROW 1: QUICK STATS */}
        <div className="dash-row-stats">
          {/* REVENUE CARDS */}
          <div className="dash-stat-card" style={{ borderColor: 'var(--accent)' }}>
            <div className="dash-stat-icon" style={{ background: 'var(--accent)' }}>
              <MonitorPlay />
            </div>
            <div className="dash-stat-content">
              <h4>Pendapatan PS</h4>
              <h2>{formatRupiah(dm.ps_revenue)}</h2>
            </div>
          </div>
          
          <div className="dash-stat-card" style={{ borderColor: '#f59e0b' }}>
            <div className="dash-stat-icon" style={{ background: '#f59e0b' }}>
              <ShoppingCart />
            </div>
            <div className="dash-stat-content">
              <h4>Pendapatan F&B</h4>
              <h2>{formatRupiah(dm.fb_revenue)}</h2>
            </div>
          </div>

          <div className="dash-stat-card" style={{ borderColor: 'var(--success)' }}>
            <div className="dash-stat-icon" style={{ background: 'var(--success)' }}>
              <DollarSign />
            </div>
            <div className="dash-stat-content">
              <h4>Pendapatan Kotor</h4>
              <h2>{formatRupiah(dm.gross_revenue)}</h2>
            </div>
          </div>

          <div className="dash-stat-card" style={{ borderColor: 'var(--critical)' }}>
            <div className="dash-stat-icon" style={{ background: 'var(--critical)' }}>
              <Activity />
            </div>
            <div className="dash-stat-content">
              <h4>Total Pengeluaran</h4>
              <h2>{formatRupiah(dm.total_expense)}</h2>
            </div>
          </div>

          <div className="dash-stat-card" style={{ borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
            <div className="dash-stat-icon" style={{ background: '#10b981' }}>
              <DollarSign />
            </div>
            <div className="dash-stat-content">
              <h4>Pendapatan Bersih</h4>
              <h2 style={{ color: '#10b981' }}>{formatRupiah(dm.net_revenue)}</h2>
            </div>
          </div>
        </div>

        {/* ROW 2: CHARTS & NOTIFICATIONS */}
        <div className="dash-row-charts">
          {/* Line Chart */}
          <div className="dash-panel" style={{ gridColumn: 'span 2' }}>
            <h3>
              Grafik Pendapatan
              <select style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--surface-alt)', border: 'none', color: 'var(--text)', borderRadius: '6px' }}>
                <option>7 Hari Terakhir</option>
              </select>
            </h3>
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--accent)' }}
                    formatter={(value) => formatRupiah(value)}
                  />
                  <Line type="monotone" dataKey="income" stroke="var(--accent)" strokeWidth={3} dot={{ fill: 'var(--accent)', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="dash-panel">
            <h3>Status Komputer/PS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px' }}>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={donutData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', fontSize: '12px' }}>
                {donutData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: d.color }}></div>
                    <span style={{ color: 'var(--text-muted)' }}>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: ACTIVE SESSIONS LIST (NEW) */}
        <div className="dash-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Sesi Aktif Saat Ini</h3>
          </div>
          
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Perangkat</th>
                  <th>Pelanggan</th>
                  <th>Mulai</th>
                  <th>Durasi</th>
                  <th>Sisa Waktu</th>
                  <th>Total</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {safeSessions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      Tidak ada sesi yang sedang berjalan
                    </td>
                  </tr>
                ) : (
                  safeSessions.map(session => {
                    const start = new Date(session.start_time);
                    const end = new Date(session.planned_end_time);
                    const remainingMs = end - new Date();
                    const hoursRemaining = Math.floor(remainingMs / 3600000);
                    const minsRemaining = Math.floor((remainingMs % 3600000) / 60000);
                    const isOver = remainingMs <= 0;
                    
                    return (
                      <tr key={session.id}>
                        <td><strong style={{ color: 'var(--accent)' }}>{session.unit_name}</strong></td>
                        <td>{session.customer_name || '-'}</td>
                        <td>{start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>{session.total_minutes} mnt</td>
                        <td>
                          <span style={{ color: isOver ? 'var(--critical)' : 'var(--success)', fontWeight: 'bold' }} className={isOver ? 'pulse' : ''}>
                            {isOver ? 'Habis' : `${hoursRemaining}j ${minsRemaining}m`}
                          </span>
                        </td>
                        <td>{formatRupiah(session.total_amount)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="btn btn--sm" 
                            style={{ background: 'var(--critical)', color: '#fff' }}
                            onClick={() => setModal({ type: 'complete', session, unit: { id: session.unit_id, name: session.unit_name } })}
                          >
                            Akhiri
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROW 4: UNIT GRID (OLD LAYOUT BUT KEPT FOR EASY VISUALIZATION) */}
        <div className="dash-panel">
          <h3>Peta Unit Komputer & Konsol</h3>
          <div className="unit-grid">
            {safeUnits.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                session={sessionByUnit[unit.id]}
                onStart={(u) => setModal({ type: 'start', unit: u })}
                onComplete={(s) => setModal({ type: 'complete', session: s, unit: unit })}
                onMaintenance={handleMaintenance}
              />
            ))}
            {safeUnits.length === 0 && <p style={{color: 'var(--text-muted)'}}>Belum ada unit.</p>}
          </div>
          </div>
        </div>

        {/* EXPENSE DETAILS SECTION */}
        <div style={{ marginTop: '24px' }}>
          <div className="dash-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="var(--critical)" />
              Rincian Pengeluaran
            </h3>
            {dm.expense_details && dm.expense_details.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Tanggal</th>
                      <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Keterangan</th>
                      <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dm.expense_details.map(exp => (
                      <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px' }}>{new Date(exp.created_at).toLocaleString('id-ID')}</td>
                        <td style={{ padding: '12px' }}>{exp.description}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: 'var(--critical)' }}>
                          {formatRupiah(exp.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Tidak ada pengeluaran pada periode ini.</p>
            )}
          </div>
        </div>

      {/* MODALS */}
      {modal?.type === 'start' && (
        <Modal title={`Mulai ${modal.unit.name}`} onClose={() => setModal(null)}>
          <SessionForm
            unit={modal.unit}
            packages={packages || []}
            onSubmit={handleStartSession}
            onCancel={() => setModal(null)}
            submitting={submitting}
          />
        </Modal>
      )}

      {modal?.type === 'complete' && (
        <Modal title={`Selesaikan ${modal.unit.name}`} onClose={() => setModal(null)}>
          <PaymentForm
            session={modal.session}
            unit={modal.unit}
            packages={packages || []}
            onSubmit={handleCompleteSession}
            onCancel={() => setModal(null)}
            submitting={submitting}
          />
        </Modal>
      )}
    </div>
  );
}
