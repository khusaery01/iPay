import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirmation, setPinConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openingDoor, setOpeningDoor] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone && !email) {
      setError('Nomor HP atau Email wajib diisi.');
      return;
    }

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError('PIN harus berupa 6 digit angka.');
      return;
    }

    if (pin !== pinConfirmation) {
      setError('Konfirmasi PIN tidak cocok dengan PIN.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name,
        phone: phone || undefined,
        email: email || undefined,
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
      setError(err.response?.data?.message || 'Pendaftaran gagal. Silakan coba kembali.');
      setLoading(false);
    }
  };

  return (
    <div className={`split-auth-container ${openingDoor ? 'opening-door' : ''}`}>
      {/* Left Panel: Indigo Branding */}
      <div className={`auth-panel-left ${openingDoor ? 'door-open-left' : ''}`}>
        <div className="brand-glow-bg"></div>
        <div className="brand-grid-pattern"></div>
        
        <div className="auth-brand-top">
          <div className="header-logo-badge" style={{ width: '44px', height: '44px', fontSize: '1.25rem' }}>iP</div>
          <span className="brand-title">iPay Platform</span>
        </div>

        <div className="auth-brand-center">
          <div className="brand-badge-pill">Bergabung Bersama Kami</div>
          <h1 className="brand-headline">Nikmati Kemudahan Pembayaran Digital Masa Kini.</h1>
          <p className="brand-subtext">
            Daftarkan diri Anda dalam hitungan detik untuk mendapatkan iPay ID unik dan akses ke seluruh fitur dompet digital.
          </p>

          <div className="brand-feature-card">
            <div className="feature-icon">⚡</div>
            <div>
              <div className="feature-title">Registrasi Cepat & Tanpa Ribet</div>
              <div className="feature-desc">Langsung aktif & siap digunakan untuk transaksi instan.</div>
            </div>
          </div>
        </div>

        <div className="auth-brand-bottom">
          <span>© 2026 iPay Digital Ecosystem. All rights reserved.</span>
        </div>
      </div>

      {/* Right Panel: Clean Integrated Register Form */}
      <div className={`auth-panel-right ${openingDoor ? 'door-open-right' : ''}`}>
        <div className="auth-form-wrapper register-slide-down">
          <div className="auth-form-header stagger-item" style={{ animationDelay: '100ms' }}>
            <h2 className="form-title">Daftar Akun Baru</h2>
            <p className="form-subtitle">Lengkapi formulir untuk membuat dompet iPay Anda</p>
          </div>

          {error && (
            <div className="alert-error stagger-item" style={{ animationDelay: '150ms' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} style={{ width: '100%' }}>
            <div className="form-group stagger-item" style={{ animationDelay: '200ms' }}>
              <label className="form-label">Nama Lengkap</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group stagger-item" style={{ animationDelay: '300ms' }}>
              <label className="form-label">Nomor Handphone (Utama)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Contoh: 081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group stagger-item" style={{ animationDelay: '400ms' }}>
              <label className="form-label">Email (Opsional)</label>
              <input
                type="email"
                className="form-input"
                placeholder="budi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group stagger-item" style={{ animationDelay: '500ms' }}>
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
              />
            </div>

            <div className="form-group stagger-item" style={{ animationDelay: '600ms' }}>
              <label className="form-label">Konfirmasi PIN (6 Digit Angka)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="form-input"
                placeholder="••••••"
                value={pinConfirmation}
                onChange={(e) => setPinConfirmation(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary stagger-item"
              style={{ animationDelay: '700ms', marginTop: '10px' }}
              disabled={loading || openingDoor}
            >
              {loading ? 'Memproses Pendaftaran...' : openingDoor ? 'Membuka Dashboard...' : 'Buat Akun iPay →'}
            </button>
          </form>

          <div className="auth-form-footer stagger-item" style={{ animationDelay: '800ms' }}>
            <span>Sudah memiliki akun iPay? </span>
            <Link to="/login" className="auth-link">Masuk di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
