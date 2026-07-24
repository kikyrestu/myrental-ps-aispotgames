import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/shared/Button';
import { TrendingUp, UserCheck } from 'lucide-react';

export default function MitraLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/mitra-dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#0a0a0f',
      color: '#fff',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Left side: Premium Image/Branding */}
      <div style={{
        flex: '1',
        display: 'none',
        '@media (minWidth: 768px)': {
          display: 'block'
        },
        position: 'relative',
        background: 'linear-gradient(45deg, #2e72f8 0%, #8b5cf6 100%)',
        overflow: 'hidden'
      }} className="mitra-hero">
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute',
          top: '50%', left: '10%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          maxWidth: '80%'
        }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.2' }}>
            Pantau Aset Anda<br/>Di Mana Saja.
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9, lineHeight: '1.6' }}>
            Portal eksklusif bagi Mitra Investor untuk melihat performa unit, 
            menarik komisi, dan memantau bisnis rental PS secara real-time.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 10%',
        position: 'relative',
        background: '#0a0a0f'
      }}>
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', marginBottom: '24px' }}>
              <TrendingUp color="#8b5cf6" size={32} />
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Portal Mitra
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '15px' }}>
              Silakan login ke akun investor Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert--error" style={{ marginBottom: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}>{error}</div>}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Username Investor</label>
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                autoFocus 
                required 
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '16px', outline: 'none', transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div style={{ marginBottom: '40px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '16px', outline: 'none', transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <Button type="submit" variant="primary" fullWidth loading={submitting} style={{
              padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', 
              background: 'linear-gradient(45deg, #2e72f8, #8b5cf6)', border: 'none',
              boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)'
            }}>
              Akses Dashboard Utama
            </Button>
          </form>

          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <p style={{ color: '#71717a', fontSize: '14px' }}>
              &copy; {new Date().getFullYear()} Rental PS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
