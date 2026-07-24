import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/shared/Button';

export default function LoginPage() {
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
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Rental PS</h1>
        <p className="login-card__subtitle">Masuk buat mulai shift</p>

        {error && <div className="alert alert--error">{error}</div>}

        <label className="form__field">
          <span>Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
        </label>

        <label className="form__field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        <Button type="submit" variant="primary" fullWidth loading={submitting}>
          Masuk
        </Button>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/mitra-login" style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none' }}>
            Masuk sebagai Mitra/Investor
          </Link>
        </div>
      </form>
    </div>
  );
}
