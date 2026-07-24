import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Gamepad2, LayoutDashboard, MonitorPlay, Coffee, 
  Wallet, Database, Tags, Utensils, Boxes, 
  LineChart, Handshake, Coins, LogOut, Menu, X
} from 'lucide-react';

export default function NavBar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Jika Mitra, menu simpel jadi gak perlu bottom sheet kompleks
  if (user?.role === 'mitra') {
    return (
      <>
        {!isMobile ? (
          <aside className="sidebar">
            <div className="sidebar__brand">
              <div className="sidebar__logo"><Gamepad2 size={24} /></div>
              <span>Rental PS</span>
            </div>
            <div className="sidebar__links">
              <div className="sidebar__category" style={{ marginTop: 0 }}>Portal Mitra</div>
              <NavLink to="/mitra-dashboard" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                <span className="icon"><LayoutDashboard size={18} /></span> Dashboard Mitra
              </NavLink>
            </div>
            <div className="sidebar__user">
              <div className="sidebar__user-info">
                <strong>{user?.full_name}</strong>
                <span className="sidebar__user-role">{user?.role}</span>
              </div>
              <button className="btn btn--ghost btn--sm" onClick={logout} title="Keluar">
                <LogOut size={18} />
              </button>
            </div>
          </aside>
        ) : (
          <nav className="mobile-bottom-nav">
            <NavLink to="/mitra-dashboard" className={({ isActive }) => (isActive ? 'is-active' : '')} onClick={closeMobileMenu}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <button className="menu-btn" onClick={logout}>
              <LogOut size={20} />
              <span>Keluar</span>
            </button>
          </nav>
        )}
      </>
    );
  }

  // --- Layout Admin / Kasir ---
  return (
    <>
      {/* 1. DESKTOP SIDEBAR */}
      {!isMobile && (
        <aside className="sidebar">
          <div className="sidebar__brand">
            <div className="sidebar__logo"><Gamepad2 size={24} /></div>
            <span>Rental PS</span>
          </div>
          <div className="sidebar__links">
            <div className="sidebar__category" style={{ marginTop: 0 }}>Operasional</div>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <span className="icon"><LayoutDashboard size={18} /></span> Dashboard
            </NavLink>
            <NavLink to="/pos-ps" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <span className="icon"><MonitorPlay size={18} /></span> POS PS / Warnet
            </NavLink>
            <NavLink to="/pos-fb" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <span className="icon"><Coffee size={18} /></span> POS F&B
            </NavLink>
            <NavLink to="/finance" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <span className="icon"><Wallet size={18} /></span> Keuangan
            </NavLink>
            
            <div className="sidebar__category">Data & Promo</div>
            <NavLink to="/master-data" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <span className="icon"><Database size={18} /></span> Master Data
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/promo" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                <span className="icon"><Tags size={18} /></span> Promo
              </NavLink>
            )}

            {user?.role === 'admin' && (
              <>
                <div className="sidebar__category">Inventory (F&B)</div>
                <NavLink to="/products" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                  <span className="icon"><Utensils size={18} /></span> Produk F&B
                </NavLink>
                <NavLink to="/stocks" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                  <span className="icon"><Boxes size={18} /></span> Stok Opname
                </NavLink>

                <div className="sidebar__category">Keuangan & Mitra</div>
                <NavLink to="/report" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                  <span className="icon"><LineChart size={18} /></span> Laporan
                </NavLink>
                <NavLink to="/owners" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                  <span className="icon"><Handshake size={18} /></span> Investor
                </NavLink>
                <NavLink to="/commissions" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                  <span className="icon"><Coins size={18} /></span> Bagi Hasil
                </NavLink>
              </>
            )}
          </div>
          <div className="sidebar__user">
            <div className="sidebar__user-info">
              <strong>{user?.full_name}</strong>
              <span className="sidebar__user-role">{user?.role}</span>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={logout} title="Keluar">
              <LogOut size={18} />
            </button>
          </div>
        </aside>
      )}

      {/* 2. MOBILE BOTTOM BAR */}
      {isMobile && (
        <>
          <nav className="mobile-bottom-nav">
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'is-active' : '')} onClick={closeMobileMenu}>
              <LayoutDashboard size={20} />
              <span>Beranda</span>
            </NavLink>
            <NavLink to="/pos-ps" className={({ isActive }) => (isActive ? 'is-active' : '')} onClick={closeMobileMenu}>
              <MonitorPlay size={20} />
              <span>POS</span>
            </NavLink>
            <NavLink to="/finance" className={({ isActive }) => (isActive ? 'is-active' : '')} onClick={closeMobileMenu}>
              <Wallet size={20} />
              <span>Kas</span>
            </NavLink>
            <button className={`menu-btn ${isMobileMenuOpen ? 'is-active' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              <span>Menu</span>
            </button>
          </nav>

          {/* 3. MOBILE BOTTOM SHEET GRID */}
          <div className={`mobile-bottom-sheet ${isMobileMenuOpen ? 'is-open' : ''}`}>
            <div className="sheet-header">
              <h3>Menu Lainnya</h3>
            </div>
            <div className="sheet-grid">
              <NavLink to="/pos-fb" onClick={closeMobileMenu}>
                <div className="grid-icon"><Coffee size={24} /></div>
                <span>POS F&B</span>
              </NavLink>
              <NavLink to="/master-data" onClick={closeMobileMenu}>
                <div className="grid-icon"><Database size={24} /></div>
                <span>Data</span>
              </NavLink>
              
              {user?.role === 'admin' && (
                <>
                  <NavLink to="/promo" onClick={closeMobileMenu}>
                    <div className="grid-icon"><Tags size={24} /></div>
                    <span>Promo</span>
                  </NavLink>
                  <NavLink to="/products" onClick={closeMobileMenu}>
                    <div className="grid-icon"><Utensils size={24} /></div>
                    <span>Produk</span>
                  </NavLink>
                  <NavLink to="/stocks" onClick={closeMobileMenu}>
                    <div className="grid-icon"><Boxes size={24} /></div>
                    <span>Opname</span>
                  </NavLink>
                  <NavLink to="/report" onClick={closeMobileMenu}>
                    <div className="grid-icon"><LineChart size={24} /></div>
                    <span>Laporan</span>
                  </NavLink>
                  <NavLink to="/owners" onClick={closeMobileMenu}>
                    <div className="grid-icon"><Handshake size={24} /></div>
                    <span>Investor</span>
                  </NavLink>
                  <NavLink to="/commissions" onClick={closeMobileMenu}>
                    <div className="grid-icon"><Coins size={24} /></div>
                    <span>Bagi Hasil</span>
                  </NavLink>
                </>
              )}
              
              <button className="grid-btn-logout" onClick={() => { logout(); closeMobileMenu(); }}>
                <div className="grid-icon"><LogOut size={24} /></div>
                <span>Keluar</span>
              </button>
            </div>
          </div>
          
          {/* Overlay for clicking outside */}
          {isMobileMenuOpen && (
            <div className="mobile-overlay" onClick={closeMobileMenu} />
          )}
        </>
      )}
    </>
  );
}
