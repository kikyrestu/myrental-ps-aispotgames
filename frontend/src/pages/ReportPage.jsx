import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Coins, Tags, LayoutDashboard, TrendingDown } from 'lucide-react';

export default function ReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/reports/daily?date=${date}`);
      setReport(data);
    } catch (err) {
      alert('Gagal mengambil laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [date]);

  const cards = report
    ? [
        {
          label: 'Pemasukan',
          value: report.income,
          color: 'var(--success)',
          icon: <Coins size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />,
          prefix: 'Rp',
        },
        {
          label: 'Pengeluaran',
          value: report.expense,
          color: 'var(--critical)',
          icon: <TrendingDown size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />,
          prefix: 'Rp',
        },
        {
          label: 'Total Diskon',
          value: report.discount,
          color: 'var(--warning)',
          icon: <Tags size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />,
          prefix: 'Rp',
        },
        {
          label: 'Pendapatan Bersih',
          value: report.net,
          color: 'var(--accent)',
          icon: <LayoutDashboard size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />,
          prefix: 'Rp',
          highlight: true,
        },
      ]
    : [];

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>Laporan Keuangan</h1>
          <p className="page__subtitle">Rekap harian pemasukan & pengeluaran</p>
        </div>
        <div className="report-date-picker">
          <label className="form__field">
            <span>Pilih Tanggal</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>
      </header>

      {loading ? (
        <div className="app-loading" style={{ height: '40vh' }}>Memuat laporan...</div>
      ) : (
        <>
          <div className="report-grid">
            {cards.map((c) => (
              <div
                key={c.label}
                className={`report-card${c.highlight ? ' report-card--highlight' : ''}`}
              >
                <span className="report-card__icon">{c.icon}</span>
                <p className="report-card__label">{c.label}</p>
                <p className="report-card__value" style={{ color: c.color }}>
                  {c.prefix}{Number(c.value).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>

          <div className="report-summary">
            <div className="report-summary__row">
              <span>Total Transaksi</span>
              <strong>{report?.transactions_count ?? 0} transaksi</strong>
            </div>
            <div className="report-summary__row">
              <span>Tanggal</span>
              <strong>{new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
