import { useState, useEffect, useMemo } from 'react';
import { usePolling } from '../hooks/usePolling';
import { unitsApi } from '../api/units';
import { sessionsApi } from '../api/sessions';
import { membersApi } from '../api/members';
import { api } from '../api/client';
import { formatRupiah } from '../utils/format';
import { transactionsApi } from '../api/transactions';
import Modal from '../components/shared/Modal';
import Table from '../components/shared/Table';
import ReceiptModal from '../components/kasir/ReceiptModal';
import ShiftPanel from '../components/kasir/ShiftPanel';
import ExpenseForm from '../components/kasir/ExpenseForm';
import SessionTimerWidget from '../components/kasir/SessionTimerWidget';
import { Gamepad2, Wallet, Settings, MonitorPlay, Receipt, Clock } from 'lucide-react';

export default function PosPsPage() {
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  
  // Data Polling
  const { data: units, refetch: refetchUnits } = usePolling(() => unitsApi.list(), 4000);
  const { data: ongoingSessions, refetch: refetchSessions } = usePolling(() => sessionsApi.list('ongoing'), 4000);
  
  const today = new Date().toISOString().slice(0, 10);
  const { data: transactions } = usePolling(() => transactionsApi.list(today, today), 5000);
  
  const [packages, setPackages] = useState([]);
  const [members, setMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedTrxId, setSelectedTrxId] = useState(null);
  const [kasbonPersonName, setKasbonPersonName] = useState('');
  const [saveTime, setSaveTime] = useState(false);
  const [showAssignMemberModal, setShowAssignMemberModal] = useState(false);
  const [assignMemberId, setAssignMemberId] = useState('');
  const [useDepositForPackage, setUseDepositForPackage] = useState(true);
  
  // Custom Modern Dialog
  const [dialog, setDialog] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

  const showConfirm = (title, message, onConfirm) => {
    setDialog({ isOpen: true, type: 'confirm', title, message, onConfirm });
  };

  const showAlert = (title, message) => {
    setDialog({ isOpen: true, type: 'info', title, message, onConfirm: null });
  };

  useEffect(() => {
    fetchStaticData();
  }, []);

  const fetchStaticData = async () => {
    try {
      const [pkgRes, memRes] = await Promise.all([
        api.get('/packages'),
        membersApi.list()
      ]);
      setPackages(pkgRes || []);
      setMembers(memRes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAll = () => {
    refetchUnits();
    refetchSessions();
  };

  // Derived state
  const safeUnits = units || [];
  const safeSessions = ongoingSessions || [];
  
  const sessionByUnit = useMemo(() => {
    const map = {};
    safeSessions.forEach((s) => (map[s.unit_id] = s));
    return map;
  }, [safeSessions]);

  const selectedUnit = safeUnits.find(u => u.id === selectedUnitId);
  const selectedSession = selectedUnit ? sessionByUnit[selectedUnit.id] : null;
  const selectedMemberObj = useMemo(() => members.find(m => m.id == selectedMemberId), [members, selectedMemberId]);

  // Actions
  const handleStartSession = (packageId, pkgName) => {
    if (!selectedUnit) return;
    
    showConfirm('Mulai Sesi', `Mulai sesi di ${selectedUnit.name} dengan paket ${pkgName}?`, async () => {
      setSubmitting(true);
      try {
        await sessionsApi.start({
          unit_id: selectedUnit.id,
          package_id: packageId,
          member_id: selectedMemberId || undefined,
          customer_name: selectedMemberId ? undefined : (customerName || 'Walk-in'),
          session_type: 'walkin',
          use_deposit_time: useDepositForPackage
        });
        setCustomerName(''); // reset
        setSelectedMemberId('');
        refreshAll();
      } catch (err) {
        showAlert('Gagal', err.message);
      } finally {
        setSubmitting(false);
      }
    });
  };

  const handleStartSessionWithDeposit = (durationMinutes) => {
    if (!selectedUnit) return;
    
    showConfirm('Mulai Sesi (Pakai Saldo)', `Gunakan saldo deposit waktu (${durationMinutes} menit) untuk mulai sesi di ${selectedUnit.name}?`, async () => {
      setSubmitting(true);
      try {
        await sessionsApi.start({
          unit_id: selectedUnit.id,
          member_id: selectedMemberId,
          duration_minutes: durationMinutes,
          session_type: 'walkin'
        });
        setCustomerName(''); // reset
        setSelectedMemberId('');
        refreshAll();
      } catch (err) {
        showAlert('Gagal', err.message);
      } finally {
        setSubmitting(false);
      }
    });
  };

  const handleExtendTime = (minutes, label) => {
    if (!selectedSession) return;
    
    showConfirm('Tambah Waktu', `Yakin ingin menambah waktu ${label} untuk sesi ini?`, async () => {
      setSubmitting(true);
      try {
        await sessionsApi.extend(selectedSession.id, minutes);
        refreshAll();
      } catch (err) {
        showAlert('Gagal', err.message);
      } finally {
        setSubmitting(false);
      }
    });
  };

  // F&B handled in separate page

  const submitCompleteSession = async (assignedMemberId = '') => {
    setSubmitting(true);
    try {
      await sessionsApi.complete(selectedSession.id, paymentMethod, '', '', saveTime, kasbonPersonName, assignedMemberId);
      setSelectedUnitId(null);
      setPaymentMethod('cash'); // Reset default
      setKasbonPersonName('');
      setSaveTime(false);
      setAssignMemberId('');
      setShowAssignMemberModal(false);
      refreshAll();
      showAlert('Sukses', 'Sesi berhasil diselesaikan dan tagihan tercatat.');
    } catch (err) {
      showAlert('Gagal', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSession = () => {
    if (!selectedSession) return;
    
    if (!selectedSession.member_id) {
      setShowAssignMemberModal(true);
    } else {
      showConfirm('Akhiri Sesi', 'Akhiri sesi ini dan proses pembayaran?', () => {
        submitCompleteSession();
      });
    }
  };

  const CATEGORY_LABEL = {
    sewa: 'Sewa PS',
    produk: 'F&B',
    lainnya: 'Lainnya',
  };

  const historyColumns = [
    { key: 'created_at', label: 'Waktu', render: (r) => new Date(r.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
    { key: 'customer_name', label: 'Pelanggan', render: (r) => r.customer_name || '-' },
    { key: 'category', label: 'Kategori', render: (r) => CATEGORY_LABEL[r.category] || r.category },
    {
      key: 'amount',
      label: 'Jumlah',
      render: (r) => formatRupiah(Number(r.amount) - Number(r.discount_amount || 0)),
    },
    { key: 'kasir_name', label: 'Kasir' },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (r) => (
        <button className="btn btn--primary btn--sm" onClick={() => setSelectedTrxId(r.id)}>
          Struk
        </button>
      ),
    },
  ];

  const renderLeftPanel = () => {
    return (
      <div className="pos-grid">
          {safeUnits.map(unit => {
            const isPlaying = sessionByUnit[unit.id];
            const isSelected = selectedUnitId === unit.id;
            const isMaintenance = unit.status === 'maintenance';
            let cardClass = 'pos-card ';
            if (isSelected) cardClass += 'is-selected ';
            if (isPlaying) cardClass += 'is-active-session ';
            else if (isMaintenance) cardClass += 'is-maintenance ';
            else cardClass += 'is-empty ';

            return (
              <div 
                key={unit.id} 
                className={cardClass} 
                style={isMaintenance ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                onClick={() => !isMaintenance && setSelectedUnitId(isSelected ? null : unit.id)}
              >
                <div className="pos-card-icon">{unit.console_type.includes('PS5') ? <Gamepad2 size={16} /> : <MonitorPlay size={16} />}</div>
                <div className="pos-card-title">{unit.name}</div>
                <div className="pos-card-subtitle">{isMaintenance ? <><Settings size={14} /> Maintenance</> : isPlaying ? 'Sedang Main' : 'Tersedia'}</div>
                {isPlaying && (
                  <SessionTimerWidget session={isPlaying} compact={true} />
                )}
              </div>
            );
          })}
        </div>
    );
  };

  const renderCart = () => {
    if (selectedUnitId === null) {
      return (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}><Gamepad2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /></div>
          <h3>Pilih Unit PS</h3>
          <p>Klik unit di sebelah kiri untuk mulai atau mengelola sesi.</p>
        </div>
      );
    }

    if (selectedUnit && !selectedSession) {
      // START NEW SESSION
      return (
        <>
          <div className="cart-header">
            <div>
              <h3 style={{ margin: 0 }}>Mulai Billing - {selectedUnit.name}</h3>
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                Tipe: {selectedUnit.console_type}
              </span>
            </div>
          </div>
          <div className="cart-body">
            <div style={{ marginBottom: 16 }}>
              <label className="form__field" style={{ marginBottom: 12 }}>
                <span>Pilih Member (Opsional)</span>
                <select 
                  value={selectedMemberId}
                  onChange={(e) => {
                    setSelectedMemberId(e.target.value);
                    if (e.target.value) setCustomerName(''); // reset if member selected
                  }}
                >
                  <option value="">-- Bukan Member (Walk-in) --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                  ))}
                </select>
              </label>

              {selectedMemberObj && (
                <div style={{ marginBottom: 16, padding: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Saldo Deposit Waktu:</span>
                    <strong style={{ color: 'var(--accent)', fontSize: '15px' }}>{selectedMemberObj.time_balance} Menit</strong>
                  </p>
                  {selectedMemberObj.time_balance > 0 && (
                    <button 
                      className="btn btn--primary btn--sm" 
                      style={{ marginTop: 12, width: '100%' }}
                      disabled={submitting}
                      onClick={() => handleStartSessionWithDeposit(selectedMemberObj.time_balance)}
                    >
                      Lanjutkan pakai Saldo Waktu
                    </button>
                  )}
                </div>
              )}

              {!selectedMemberId && (
                <label className="form__field" style={{ marginBottom: 12 }}>
                  <span>Atau Ketik Nama Pelanggan</span>
                  <input 
                    type="text" 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)} 
                    placeholder="Misal: Budi / Walk-in" 
                  />
                </label>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Pilih paket waktu untuk memulai:</p>
              {selectedMemberObj && selectedMemberObj.time_balance > 0 && (
                <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={useDepositForPackage} 
                    onChange={e => setUseDepositForPackage(e.target.checked)} 
                  />
                  <span>Gabung Saldo Waktu</span>
                </label>
              )}
            </div>

            <div className="quick-add-grid">
              {packages
                .filter(p => {
                  if (!p.console_type || p.console_type === 'Semua') return true;
                  if (selectedUnit.console_type && selectedUnit.console_type.includes(p.console_type)) return true;
                  return false;
                })
                .map(p => {
                  return (
                    <button key={p.id} className="btn-quick" disabled={submitting} onClick={() => handleStartSession(p.id, p.name)}>
                      {p.name}<br/>
                      <span style={{ fontSize: 11, fontWeight: 'normal', color: 'var(--text-muted)' }}>{formatRupiah(p.price)}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </>
      );
    }

    if (selectedUnit && selectedSession) {
      // MANAGE ACTIVE SESSION
      // BUG 15 FIX: Append timezone hint — server pakai Asia/Jakarta (UTC+7)
      const plannedEndStr = selectedSession.planned_end_time?.includes('+') 
        ? selectedSession.planned_end_time 
        : selectedSession.planned_end_time + '+07:00';
      const isOver = new Date(plannedEndStr.replace(' ', 'T')) < new Date();
      return (
        <>
          <div className="cart-header" style={{ borderBottomColor: 'var(--accent)' }}>
            <h3>{selectedUnit.name} <span style={{ color: isOver ? 'var(--critical)' : 'var(--success)', fontSize: 12 }}>{isOver ? '(WAKTU HABIS)' : '(MAIN)'}</span></h3>
          </div>
          <div className="cart-body">
            
            <SessionTimerWidget session={selectedSession} />

            {/* WAKTU SECTION */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <strong style={{ fontSize: 13, color: 'var(--text-muted)' }}>TAMBAH WAKTU</strong>
              </div>
              <div className="quick-add-grid">
                <button className="btn-quick" disabled={submitting} onClick={() => handleExtendTime(15, '15 Menit')}>+15 Mnt</button>
                <button className="btn-quick" disabled={submitting} onClick={() => handleExtendTime(30, '30 Menit')}>+30 Mnt</button>
                <button className="btn-quick" disabled={submitting} onClick={() => handleExtendTime(60, '1 Jam')}>+1 Jam</button>
                {packages
                  .filter(p => p.duration_minutes > 0)
                  .filter(p => {
                    if (!p.console_type || p.console_type === 'Semua') return true;
                    if (selectedUnit.console_type && selectedUnit.console_type.includes(p.console_type)) return true;
                    return false;
                  })
                  .map(p => (
                  <button key={p.id} className="btn-quick" disabled={submitting} onClick={() => handleExtendTime(p.duration_minutes, p.name)}>+{p.name}</button>
                ))}
              </div>
            </div>

          </div>
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Estimasi Tagihan Sewa:</span>
              <span style={{ fontWeight: 600 }}>{(() => {
                // Estimasi tagihan sementara
                const pkg = packages.find(p => p.id == selectedSession.package_id);
                if (!pkg) return 'Rp 0';
                
                const pkgBasePrice = Number(pkg.price);
                const pkgDuration = Number(pkg.duration_minutes);
                
                if (pkgDuration === 0) {
                  const totalMins = Number(selectedSession.duration_minutes || 0) + Number(selectedSession.extra_minutes || 0);
                  return formatRupiah((totalMins / 60) * pkgBasePrice);
                }
                
                let extraCharge = 0;
                const extraMins = Number(selectedSession.extra_minutes || 0);
                if (extraMins > 0) {
                  extraCharge = (pkgBasePrice / pkgDuration) * extraMins;
                }
                return formatRupiah(pkgBasePrice + extraCharge);
              })()}</span>
            </div>
            
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Metode Pembayaran</label>
              <select 
                className="form__field"
                style={{ width: '100%', padding: '8px' }}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash / Tunai</option>
                <option value="qris">QRIS</option>
                <option value="transfer">Transfer Bank</option>
                <option value="kasbon">Kasbon / Piutang</option>
              </select>
            </div>

            {paymentMethod === 'kasbon' && !selectedSession.member_id && (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Nama Pengutang (Wajib)</label>
                <input 
                  type="text" 
                  className="form__field"
                  placeholder="Nama orang yang ngutang"
                  style={{ width: '100%', padding: '8px' }}
                  value={kasbonPersonName}
                  onChange={(e) => setKasbonPersonName(e.target.value)}
                />
              </div>
            )}

            {selectedSession.member_id && (
              <div style={{ marginTop: 12 }}>
                <label className="form__field" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={saveTime} onChange={e => setSaveTime(e.target.checked)} style={{ width: 'auto' }} />
                  <span style={{ fontSize: '13px', margin: 0 }}>Simpan sisa waktu ke saldo deposit member</span>
                </label>
              </div>
            )}

            <button 
              className="btn btn--full" 
              style={{ marginTop: 16, background: 'var(--critical)', color: '#fff', fontSize: 15, padding: '12px 16px' }}
              onClick={handleCompleteSession}
              disabled={submitting}
            >
              Akhiri Sesi & Bayar
            </button>
          </div>
        </>
      );
    }
    
    return null;
  };

  return (
    <div className="pos-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '16px 24px' }}>
      <header className="page__header" style={{ marginBottom: 16, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24 }}>POS Kasir</h1>
          <p className="page__subtitle" style={{ fontSize: 13 }}>Pusat operasional sewa PS</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn--ghost btn--sm" onClick={() => setShowHistoryModal(true)}><Receipt size={16} /> Riwayat Hari Ini</button>
          <button className="btn btn--ghost btn--sm" onClick={() => setShowExpenseModal(true)}><Wallet size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Kas Keluar</button>
          <button className="btn btn--ghost btn--sm" onClick={() => setShowShiftModal(true)}><Clock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Buka/Tutup Kasir</button>
        </div>
      </header>

      <div className="pos-wrapper" style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
        {/* LEFT PANEL */}
        <div className="pos-main">
          <div className="pos-content">
            {renderLeftPanel()}
          </div>
        </div>

        {/* RIGHT PANEL (CART) */}
        <div className="pos-sidebar">
          {renderCart()}
        </div>
      </div>

      {/* Modern Dialog */}
      {dialog.isOpen && (
        <Modal title={dialog.title} onClose={() => setDialog({ ...dialog, isOpen: false })}>
          <p style={{ margin: '12px 0', fontSize: '15px' }}>{dialog.message}</p>
          <div className="modal__actions" style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            {dialog.type === 'confirm' && (
              <button className="btn btn--ghost" onClick={() => setDialog({ ...dialog, isOpen: false })}>Batal</button>
            )}
            <button className="btn btn--primary" onClick={() => {
              if (dialog.onConfirm) dialog.onConfirm();
              setDialog({ ...dialog, isOpen: false });
            }}>
              {dialog.type === 'confirm' ? 'Ya, Lanjutkan' : 'OK'}
            </button>
          </div>
        </Modal>
      )}

      {/* Modals for old Kasir functionalities */}
      {showShiftModal && (
        <Modal title="Manajemen Shift" onClose={() => setShowShiftModal(false)}>
          <ShiftPanel />
        </Modal>
      )}
      
      {showExpenseModal && (
        <Modal title="Catat Pengeluaran" onClose={() => setShowExpenseModal(false)}>
          <ExpenseForm />
        </Modal>
      )}

      {showHistoryModal && (
        <Modal title="Riwayat Transaksi Hari Ini" onClose={() => setShowHistoryModal(false)}>
          <div style={{ minWidth: 'min(700px, 100vw)', maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
            <Table 
              columns={historyColumns} 
              rows={transactions || []} 
              emptyMessage="Belum ada transaksi hari ini" 
            />
          </div>
        </Modal>
      )}

      {selectedTrxId && (
        <ReceiptModal 
          transactionId={selectedTrxId} 
          onClose={() => setSelectedTrxId(null)} 
        />
      )}

      {showAssignMemberModal && (
        <Modal title="Pilih Member?" onClose={() => setShowAssignMemberModal(false)}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Sesi ini berjalan tanpa Member. Apakah Anda ingin mendaftarkan riwayat sesi ini ke Member agar mereka dapat poin/deposit sisa waktu?
            </p>
            <label className="form__field" style={{ marginTop: 12 }}>
              <span>Pilih Member</span>
              <select value={assignMemberId} onChange={e => setAssignMemberId(e.target.value)}>
                <option value="">-- Lewati (Selesaikan Biasa) --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                ))}
              </select>
            </label>
            {assignMemberId && (
              <label className="form__field" style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={saveTime} onChange={e => setSaveTime(e.target.checked)} style={{ width: 'auto' }} />
                <span style={{ fontSize: '13px', margin: 0 }}>Simpan sisa waktu ke saldo deposit member</span>
              </label>
            )}
          </div>
          <div className="modal__actions" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn--ghost" onClick={() => setShowAssignMemberModal(false)}>Batal</button>
            <button className="btn btn--primary" onClick={() => submitCompleteSession(assignMemberId)}>
              {assignMemberId ? 'Simpan Member & Akhiri Sesi' : 'Tetap Akhiri Sesi'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
