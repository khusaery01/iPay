import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { CustomButton } from '../components/CustomButton';
import { CustomTextField } from '../components/CustomTextField';
import { WalletIcon, UserIcon, LockIcon } from '../components/Icons';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim()) {
      setErrorMessage('Nama lengkap dan email wajib diisi.');
      return;
    }

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setErrorMessage('PIN harus 6 digit angka.');
      return;
    }

    if (pin !== confirmPin) {
      setErrorMessage('PIN dan konfirmasi PIN tidak cocok.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        pin,
        pin_confirmation: confirmPin,
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
        navigate('/login');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Registrasi gagal. Silakan coba lagi.');
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
        <form onSubmit={handleRegister}>
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
              margin: '0 auto 16px auto',
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
              marginBottom: '6px',
            }}
          >
            Daftar Akun Baru
          </h1>

          <p
            style={{
              fontSize: '13.5px',
              color: '#64748B',
              textAlign: 'center',
              marginBottom: '28px',
              lineHeight: 1.45,
            }}
          >
            Buat akun iPay untuk mulai bertransaksi mudah dan aman
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

          {/* Nama */}
          <CustomTextField
            label="Nama Lengkap"
            placeholder="Contoh: Budi Santoso"
            prefixIcon={<UserIcon size={18} />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          {/* Email */}
          <CustomTextField
            label="Alamat Email"
            type="email"
            placeholder="Contoh: budi@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Nomor HP */}
          <CustomTextField
            label="Nomor HP (Opsional)"
            placeholder="Contoh: 081234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* PIN */}
          <CustomTextField
            label="PIN Keamanan (6 Digit)"
            placeholder="••••••"
            type="password"
            maxLength={6}
            prefixIcon={<LockIcon size={18} />}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            required
          />

          {/* Konfirmasi PIN */}
          <CustomTextField
            label="Konfirmasi PIN"
            placeholder="••••••"
            type="password"
            maxLength={6}
            prefixIcon={<LockIcon size={18} />}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            required
          />

          <div style={{ marginTop: '24px', marginBottom: '20px' }}>
            <CustomButton
              text="Daftar Sekarang"
              type="submit"
              isLoading={loading}
            />
          </div>

          {/* Login Link */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '13.5px',
              color: '#64748B',
            }}
          >
            Sudah punya akun?{' '}
            <Link
              to="/login"
              style={{
                color: '#4F46E5',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Masuk Sekarang
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
