import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import MitraLoginPage from './pages/MitraLoginPage';
import DashboardPage from './pages/DashboardPage';
import PosPsPage from './pages/PosPsPage';
import PosFbPage from './pages/PosFbPage';
import PromoPage from './pages/PromoPage';
import ReportPage from './pages/ReportPage';
import StockOpnamePage from './pages/StockOpnamePage';
import MasterDataPage from './pages/MasterDataPage';
import ProductPage from './pages/ProductPage';
import OwnerPage from './pages/OwnerPage';
import CommissionPage from './pages/CommissionPage';
import MemberPage from './pages/MemberPage';
import FinancePage from './pages/FinancePage';
import MitraDashboardPage from './pages/MitraDashboardPage';
import NavBar from './components/shared/NavBar';
import AutoShiftReminder from './components/shared/AutoShiftReminder';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <NavBar />
      <AutoShiftReminder />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="app-loading">Memuat...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'mitra' ? '/mitra-dashboard' : '/dashboard'} replace /> : <LoginPage />} />
      <Route path="/mitra-login" element={user ? <Navigate to={user.role === 'mitra' ? '/mitra-dashboard' : '/dashboard'} replace /> : <MitraLoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos-ps"
        element={
          <ProtectedRoute>
            <PosPsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos-fb"
        element={
          <ProtectedRoute>
            <PosFbPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/master-data"
        element={
          <ProtectedRoute>
            <MasterDataPage />
          </ProtectedRoute>
        }
      />
      <Route path="/promo" element={<ProtectedRoute><PromoPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><ProductPage /></ProtectedRoute>} />
      <Route path="/stocks" element={<ProtectedRoute><StockOpnamePage /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
      <Route path="/owners" element={<ProtectedRoute><OwnerPage /></ProtectedRoute>} />
      <Route path="/commissions" element={<ProtectedRoute><CommissionPage /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><MemberPage /></ProtectedRoute>} />
      <Route path="/mitra-dashboard" element={<ProtectedRoute><MitraDashboardPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? (user.role === 'mitra' ? '/mitra-dashboard' : '/dashboard') : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
