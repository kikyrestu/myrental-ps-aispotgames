import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import UnitPage from './UnitPage';
import PackagePage from './PackagePage';
import MemberPage from './MemberPage';
import ConsoleTypePage from './ConsoleTypePage';
import ProductCategoryPage from './ProductCategoryPage';
import SettingsPage from './SettingsPage';
import { Gamepad2, Users, Joystick, Clock, FolderOpen, Settings } from 'lucide-react';

export default function MasterDataPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Kasir hanya bisa buka Member, jadi default ke member kalau bukan admin
  const [activeTab, setActiveTab] = useState(isAdmin ? 'units' : 'member');

  return (
    <div className="page fade-in">
      <header className="page__header">
        <div>
          <h1>Master Data</h1>
          <p className="page__subtitle">Kelola data dasar sistem rental PS</p>
        </div>
      </header>

      <div className="tabs">
        {isAdmin && (
          <>
            <button 
              className={`tab-btn ${activeTab === 'units' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('units')}
            >
              <Joystick size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Unit PS
            </button>
            <button 
              className={`tab-btn ${activeTab === 'packages' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('packages')}
            >
              <Clock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Paket & Tarif
            </button>
            <button 
              className={`tab-btn ${activeTab === 'settings' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Pengaturan
            </button>
            <button 
              className={`tab-btn ${activeTab === 'consoletypes' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('consoletypes')}
            >
              <Gamepad2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Tipe Konsol
            </button>
            <button 
              className={`tab-btn ${activeTab === 'productcategories' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('productcategories')}
            >
              <FolderOpen size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Kategori Produk
            </button>
          </>
        )}
        <button 
          className={`tab-btn ${activeTab === 'member' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('member')}
        >
          <Users size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Member
        </button>
      </div>

      <div className="tab-content" style={{ marginTop: '24px' }}>
        {activeTab === 'units' && isAdmin && <UnitPage />}
        {activeTab === 'packages' && isAdmin && <PackagePage />}
        {activeTab === 'settings' && isAdmin && <SettingsPage />}
        {activeTab === 'consoletypes' && isAdmin && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Tipe Konsol</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Atur daftar konsol (PS3, PS4, PC, dll)</p>
            </div>
            <ConsoleTypePage />
          </div>
        )}
        {activeTab === 'productcategories' && isAdmin && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Kategori Produk F&B</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Atur daftar kategori makanan dan minuman</p>
            </div>
            <ProductCategoryPage />
          </div>
        )}
        {activeTab === 'member' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Manajemen Member</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Daftarkan pelanggan setia untuk akses deposit waktu</p>
            </div>
            <MemberPage />
          </div>
        )}
      </div>
    </div>
  );
}
