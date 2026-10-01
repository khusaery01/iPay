import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { CustomButton } from '../components/CustomButton';
import { CustomTextField } from '../components/CustomTextField';
import { WalletIcon, UserIcon, LockIcon } from '../components/Icons';

export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanIdentifier = identifier.trim();
    const cleanPin = pin.trim();

    if (!cleanIdentifier) {
      setErrorMessage('Email / No HP / iPay ID wajib diisi.');
      return;
    }

    if (cleanPin.length !== 6 || !/^\d+$/.test(cleanPin)) {
      setErrorMessage('PIN harus berupa 6-digit angka.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', {
        identifier: cleanIdentifier,
        pin: cleanPin,
      });

      if (res.data?.token) {
        localStorage.setItem('ipay_token', res.data.token);
        if (res.data.user?.name) {
          localStorage.setItem('ipay_user_name', res.data.user.name);
        }
        if (res.data.user?.ipay_id) {
          localStorage.setItem('ipay_user_id', res.data.user.ipay_id);
        }
        navigate('/home');
      } else {
        setErrorMessage(res.data?.message || 'Login gagal.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Login gagal. Periksa identifier dan PIN Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          minHeight: '100vh',
          backgroundColor: '#F8FAFC',
          padding: '36px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(15, 23, 42, 0.08)',
        }}
      >
        <form onSubmit={handleLogin}>
          {/* App Branding */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
            }}
          >
            <WalletIcon size={36} color="#FFFFFF" />
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0F172A',
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            Selamat Datang di iPay
          </h1>

          <p
            style={{
              fontSize: '13.5px',
              color: '#64748B',
              textAlign: 'center',
              marginBottom: '32px',
              lineHeight: 1.45,
            }}
          >
            Masuk menggunakan Email, Nomor HP, atau iPay ID dan PIN 6-digit
          </p>

          {errorMessage && (
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '18px',
                textAlign: 'center',
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Identifier Input */}
          <CustomTextField
            label="Email / No HP / iPay ID"
            placeholder="Contoh: user@email.com atau IPY1234567"
            prefixIcon={<UserIcon size={18} />}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoFocus
          />

          {/* PIN Input */}
          <CustomTextField
            label="PIN (6 Digit)"
            placeholder="••••••"
            type="password"
            maxLength={6}
            prefixIcon={<LockIcon size={18} />}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            required
          />

          {/* Quick Demo Accounts */}
          <div style={{ marginTop: '16px', marginBottom: '8px' }}>
            <p
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748B',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Akun Uji Coba (Klik untuk Isi Otomatis):
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { name: 'Yanuar', id: 'yanuar@ipay.test', pin: '123456' },
                { name: 'Budi', id: 'budi@ipay.test', pin: '123456' },
                { name: 'Citra', id: 'citra@ipay.test', pin: '123456' },
              ].map((acc) => (
                <button
                  key={acc.name}
                  type="button"
                  onClick={() => {
                    setIdentifier(acc.id);
                    setPin(acc.pin);
                  }}
                  style={{
                    flex: '1 1 calc(33.333% - 6px)',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F1F5F9',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#EEF2FF';
                    e.currentTarget.style.borderColor = '#C7D2FE';
                    e.currentTarget.style.color = '#4F46E5';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#F1F5F9';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  ⚡ {acc.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <CustomButton
              text="Masuk Sekarang"
              type="submit"
              isLoading={loading}
            />
          </div>

          {/* Register Link */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '13.5px',
              color: '#64748B',
            }}
          >
            Belum punya akun iPay?{' '}
            <Link
              to="/register"
              style={{
                color: '#4F46E5',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Daftar Sekarang
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
