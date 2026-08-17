import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openingDoor, setOpeningDoor] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError('PIN harus berupa 6 digit angka.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        identifier,
        pin,
      });

      // Simpan token di localStorage
      localStorage.setItem('ipay_token', response.data.token);
      localStorage.setItem('ipay_user_name', response.data.user.name);
      localStorage.setItem('ipay_user_id', response.data.user.ipay_id);

      // Animasi pintu terbuka sebelum pengalihan rute
      setOpeningDoor(true);
      setTimeout(() => {
        navigate('/home');
      }, 700);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Periksa identifier dan PIN Anda.');
      setLoading(false);
    }
  };

  return (
    <div className={`split-auth-container ${openingDoor ? 'opening-door' : ''}`}>
      {/* Left Panel: Indigo Branding */}
      <div className={`auth-panel-left ${openingDoor ? 'door-open-left' : ''}`}>
        <div className="brand-glow-bg"></div>
        <div className="brand-grid-pattern"></div>
        
        <div className="auth-brand-top stagger-item" style={{ animationDelay: '100ms' }}>
          <div className="header-logo-badge" style={{ width: '44px', height: '44px', fontSize: '1.25rem' }}>iP</div>
          <span className="brand-title">iPay Platform</span>
        </div>

        <div className="auth-brand-center stagger-item" style={{ animationDelay: '200ms' }}>
          <div className="brand-badge-pill">Fintech Pembayaran Instan</div>
          <h1 className="brand-headline">Solusi Pembayaran & Transaksi Digital Masa Depan.</h1>
          <p className="brand-subtext">
            Kelola dompet digital, transfer tanpa biaya tambahan, dan otorisasi pembayaran bisnis dalam satu platform terpadu.
          </p>

          <div className="brand-feature-card">
            <div className="feature-icon">🛡️</div>
            <div>
              <div className="feature-title">Keamanan Tingkat Tinggi</div>
              <div className="feature-desc">Enkripsi transaksi & verifikasi PIN 6-digit privat.</div>
            </div>
          </div>
        </div>

        <div className="auth-brand-bottom stagger-item" style={{ animationDelay: '300ms' }}>
          <span>© 2026 iPay Digital Ecosystem. All rights reserved.</span>
        </div>
      </div>

      {/* Right Panel: Clean Integrated Form */}
      <div className={`auth-panel-right ${openingDoor ? 'door-open-right' : ''}`}>
        <div className="auth-form-wrapper">
          <div className="auth-form-header stagger-item" style={{ animationDelay: '200ms' }}>
            <h2 className="form-title">Selamat Datang Kembali</h2>
            <p className="form-subtitle">Masuk ke akun iPay Anda untuk melanjutkan transaksi</p>
          </div>

          {error && (
            <div className="alert-error stagger-item" style={{ animationDelay: '250ms' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <div className="form-group stagger-item" style={{ animationDelay: '300ms' }}>
              <label className="form-label">Email, Nomor HP, atau iPay ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: yanuar@ipay.test atau IPY0000001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group stagger-item" style={{ animationDelay: '400ms' }}>
              <label className="form-label">PIN Keamanan (6 Digit Angka)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="form-input"
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary stagger-item"
              style={{ animationDelay: '500ms', marginTop: '10px' }}
              disabled={loading || openingDoor}
            >
              {loading ? 'Memverifikasi...' : openingDoor ? 'Membuka Dashboard...' : 'Masuk Sekarang →'}
            </button>
          </form>

          <div className="auth-form-footer stagger-item" style={{ animationDelay: '600ms' }}>
            <span>Belum memiliki akun iPay? </span>
            <Link to="/register" className="auth-link">Daftar Akun Baru</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
