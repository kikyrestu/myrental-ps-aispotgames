import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { expensesApi } from '../api/expenses';
import { debtsApi } from '../api/debts';
import { fixedExpensesApi } from '../api/fixedExpenses';
import { formatRupiah, formatDate } from '../utils/format';
import Table from '../components/shared/Table';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import { Wallet, LineChart, TrendingDown, Briefcase } from 'lucide-react';

export default function FinancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pengeluaran'); // 'pengeluaran', 'utang', 'piutang'
  
  // Data states
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states (Expense)
  const [expenseCat, setExpenseCat] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmt, setExpenseAmt] = useState('');

  // Form states (Debt/Receivable)
  const [debtPerson, setDebtPerson] = useState('');
  const [debtDesc, setDebtDesc] = useState('');
  const [debtAmt, setDebtAmt] = useState('');
  const [debtDue, setDebtDue] = useState('');
  const [deductDrawer, setDeductDrawer] = useState(false);

  // Form states (Operasional/Fixed)
  const [fixedDate, setFixedDate] = useState('');
  const [fixedCat, setFixedCat] = useState('');
  const [fixedDesc, setFixedDesc] = useState('');
  const [fixedAmt, setFixedAmt] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pengeluaran') {
        const data = await expensesApi.list();
        setExpenses(data);
      } else if (activeTab === 'operasional') {
        const data = await fixedExpensesApi.list();
        setFixedExpenses(data);
      } else {
        const data = await debtsApi.list();
        setDebts(data.filter(d => d.type === activeTab));
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memuat data keuangan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseCat || !expenseAmt) return;
    setSubmitting(true);
    try {
      await expensesApi.create({ category: expenseCat, description: expenseDesc, amount: expenseAmt });
      setExpenseCat(''); setExpenseDesc(''); setExpenseAmt('');
      setShowFormModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal catat pengeluaran. Pastikan shift sudah dibuka.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (!debtPerson || !debtAmt) return;
    setSubmitting(true);
    try {
      await debtsApi.create({
        type: activeTab, // utang or piutang
        person_name: debtPerson,
        description: debtDesc,
        amount: debtAmt,
        due_date: debtDue,
        deduct_drawer: deductDrawer
      });
      setDebtPerson(''); setDebtDesc(''); setDebtAmt(''); setDebtDue(''); setDeductDrawer(false);
      setShowFormModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mencatat data');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayDebt = async (id) => {
    if (!confirm('Tandai sebagai lunas?')) return;
    try {
      await debtsApi.pay(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal update status');
    }
  };

  const handleDeleteDebt = async (id) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      await debtsApi.remove(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  const handleAddFixedExpense = async (e) => {
    e.preventDefault();
    if (!fixedDate || !fixedCat || !fixedAmt) return;
    setSubmitting(true);
    try {
      await fixedExpensesApi.create({
        expense_date: fixedDate,
        category: fixedCat,
        description: fixedDesc,
        amount: fixedAmt
      });
      setFixedDate(''); setFixedCat(''); setFixedDesc(''); setFixedAmt('');
      setShowFormModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mencatat pengeluaran operasional');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFixedExpense = async (id) => {
    if (!confirm('Hapus data operasional ini?')) return;
    try {
      await fixedExpensesApi.delete(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  // --- Columns ---
  const expenseColumns = [
    { label: 'Waktu', key: 'created_at', render: (r) => formatDate(r.created_at) },
    { label: 'Kategori', key: 'category' },
    { label: 'Deskripsi', key: 'description' },
    { label: 'Kasir', key: 'kasir_name' },
    { label: 'Jumlah', key: 'amount', render: (r) => formatRupiah(r.amount) },
  ];

  const debtColumns = [
    { label: 'Tanggal', key: 'created_at', render: (r) => formatDate(r.created_at).split(' ')[0] },
    { label: 'Nama / Pihak', key: 'person_name' },
    { label: 'Keterangan', key: 'description' },
    { label: 'Jatuh Tempo', key: 'due_date', render: (r) => r.due_date ? formatDate(r.due_date).split(' ')[0] : '-' },
    { label: 'Jumlah', key: 'amount', render: (r) => formatRupiah(r.amount) },
    { 
      label: 'Status', 
      key: 'status',
      render: (r) => (
        <span className={`status-badge status-${r.status === 'paid' ? 'success' : 'warning'}`}>
          {r.status === 'paid' ? 'Lunas' : 'Belum Lunas'}
        </span>
      )
    },
    { label: 'Kasir', key: 'kasir_name' },
    {
      label: 'Aksi',
      key: 'aksi',
      render: (r) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          {r.status === 'pending' && (
            <Button variant="primary" size="small" onClick={() => handlePayDebt(r.id)}>
              Lunasi
            </Button>
          )}
          {user?.role === 'admin' && (
            <Button variant="danger" size="small" onClick={() => handleDeleteDebt(r.id)}>
              Hapus
            </Button>
          )}
        </div>
      )
    }
  ];

  const fixedExpenseColumns = [
    { label: 'Tanggal', key: 'expense_date', render: (r) => formatDate(r.expense_date).split(' ')[0] },
    { label: 'Kategori', key: 'category' },
    { label: 'Deskripsi', key: 'description' },
    { label: 'Jumlah', key: 'amount', render: (r) => formatRupiah(r.amount) },
    { label: 'Oleh', key: 'user_name' },
    {
      label: 'Aksi',
      key: 'aksi',
      render: (r) => (
        user?.role === 'admin' && (
          <Button variant="danger" size="small" onClick={() => handleDeleteFixedExpense(r.id)}>
            Hapus
          </Button>
        )
      )
    }
  ];

  return (
    <div className="page fade-in">
      <header className="page__header">
        <div>
          <h1>Manajemen Keuangan</h1>
          <p className="page__subtitle">Kelola pengeluaran, utang, dan piutang kasir</p>
        </div>
        <Button variant="primary" onClick={() => setShowFormModal(true)}>
          + Tambah {activeTab === 'pengeluaran' ? 'Pengeluaran' : activeTab === 'operasional' ? 'Operasional' : activeTab === 'utang' ? 'Utang' : 'Piutang'}
        </Button>
      </header>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'pengeluaran' ? 'is-active' : ''}`} onClick={() => setActiveTab('pengeluaran')}>
          <Wallet size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Pengeluaran Shift
        </button>
        <button className={`tab-btn ${activeTab === 'operasional' ? 'is-active' : ''}`} onClick={() => setActiveTab('operasional')}>
          <Briefcase size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Operasional (Fixed)
        </button>
        <button className={`tab-btn ${activeTab === 'utang' ? 'is-active' : ''}`} onClick={() => setActiveTab('utang')}>
          <TrendingDown size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Utang (Payables)
        </button>
        <button className={`tab-btn ${activeTab === 'piutang' ? 'is-active' : ''}`} onClick={() => setActiveTab('piutang')}>
          <LineChart size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Piutang (Receivables)
        </button>
      </div>

      <div className="tab-content" style={{ marginTop: '24px' }}>
        <div className="card">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat data...</div>
          ) : (
            <Table 
              columns={activeTab === 'pengeluaran' ? expenseColumns : activeTab === 'operasional' ? fixedExpenseColumns : debtColumns}
              rows={activeTab === 'pengeluaran' ? expenses : activeTab === 'operasional' ? fixedExpenses : debts}
              emptyMessage={`Belum ada data ${activeTab}`}
            />
          )}
        </div>
      </div>

      {showFormModal && (
        <Modal title={`Tambah ${activeTab === 'pengeluaran' ? 'Pengeluaran' : activeTab === 'operasional' ? 'Operasional' : activeTab === 'utang' ? 'Utang' : 'Piutang'}`} onClose={() => setShowFormModal(false)}>
          {activeTab === 'pengeluaran' ? (
            <form className="form" onSubmit={handleAddExpense}>
              <label className="form__field">
                <span>Kategori</span>
                <input type="text" value={expenseCat} onChange={e => setExpenseCat(e.target.value)} required placeholder="Misal: Token Listrik" />
              </label>
              <label className="form__field">
                <span>Deskripsi (Opsional)</span>
                <input type="text" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} />
              </label>
              <label className="form__field">
                <span>Jumlah (Rp)</span>
                <input type="number" value={expenseAmt} onChange={e => setExpenseAmt(e.target.value)} required />
              </label>
              <Button type="submit" variant="primary" fullWidth loading={submitting}>Simpan</Button>
            </form>
          ) : activeTab === 'operasional' ? (
            <form className="form" onSubmit={handleAddFixedExpense}>
              <label className="form__field">
                <span>Tanggal</span>
                <input type="date" value={fixedDate} onChange={e => setFixedDate(e.target.value)} required />
              </label>
              <label className="form__field">
                <span>Kategori</span>
                <input 
                  type="text" 
                  value={fixedCat} 
                  onChange={e => setFixedCat(e.target.value)} 
                  required 
                  list="fixed-categories"
                  placeholder="Misal: Listrik, Internet, dsb"
                />
                <datalist id="fixed-categories">
                  <option value="Listrik" />
                  <option value="Internet" />
                  <option value="Sewa Tempat" />
                  <option value="Gaji Karyawan" />
                </datalist>
              </label>
              <label className="form__field">
                <span>Deskripsi (Opsional)</span>
                <input type="text" value={fixedDesc} onChange={e => setFixedDesc(e.target.value)} placeholder="Contoh: Indihome 50Mbps" />
              </label>
              <label className="form__field">
                <span>Jumlah (Rp)</span>
                <input type="number" value={fixedAmt} onChange={e => setFixedAmt(e.target.value)} required />
              </label>
              <Button type="submit" variant="primary" fullWidth loading={submitting}>Simpan</Button>
            </form>
          ) : (
            <form className="form" onSubmit={handleAddDebt}>
              <label className="form__field">
                <span>Nama / Pihak Terkait</span>
                <input type="text" value={debtPerson} onChange={e => setDebtPerson(e.target.value)} required placeholder={activeTab === 'utang' ? "Nama Supplier / Pemilik" : "Nama Member / Pelanggan"} />
              </label>
              <label className="form__field">
                <span>Deskripsi (Opsional)</span>
                <input type="text" value={debtDesc} onChange={e => setDebtDesc(e.target.value)} />
              </label>
              <label className="form__field">
                <span>Jumlah (Rp)</span>
                <input type="number" value={debtAmt} onChange={e => setDebtAmt(e.target.value)} required />
              </label>
              <label className="form__field">
                <span>Jatuh Tempo (Opsional)</span>
                <input type="date" value={debtDue} onChange={e => setDebtDue(e.target.value)} />
              </label>
              
              {activeTab === 'piutang' && (
                <label className="form__field" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={deductDrawer} onChange={e => setDeductDrawer(e.target.checked)} style={{ width: 'auto' }} />
                  <span style={{ fontSize: '13px', margin: 0 }}>Potong uang fisik dari laci kasir? (Pinjam uang tunai)</span>
                </label>
              )}
              <Button type="submit" variant="primary" fullWidth loading={submitting}>Simpan</Button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
