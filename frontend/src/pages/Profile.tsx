import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import type { User } from '../types';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // PIN change state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinConfirmation, setPinConfirmation] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPin, setLoadingPin] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pinMsg, setPinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        const u = res.data.user;
        setUser(u);
        setName(u.name || '');
        setEmail(u.email || '');
        setPhone(u.phone || '');
        localStorage.setItem('ipay_user_name', u.name);
      }
    } catch (err) {
      console.warn('Gagal memuat profil user:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    setLoadingProfile(true);

    try {
      const res = await api.put('/auth/profile', {
        name,
        email: email || undefined,
        phone: phone || undefined,
      });

      setProfileMsg({ type: 'success', text: res.data.message || 'Profil berhasil diperbarui.' });
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('ipay_user_name', res.data.user.name);
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Gagal memperbarui profil.' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMsg(null);

    if (oldPin.length !== 6 || !/^\d+$/.test(oldPin)) {
      setPinMsg({ type: 'error', text: 'PIN lama harus berupa 6 digit angka.' });
      return;
    }

    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      setPinMsg({ type: 'error', text: 'PIN baru harus berupa 6 digit angka.' });
      return;
    }

    if (newPin !== pinConfirmation) {
      setPinMsg({ type: 'error', text: 'Konfirmasi PIN baru tidak cocok.' });
      return;
    }

    setLoadingPin(true);

    try {
      const res = await api.put('/auth/pin', {
        old_pin: oldPin,
        new_pin: newPin,
      });

      setPinMsg({ type: 'success', text: res.data.message || 'PIN berhasil diubah.' });
      setOldPin('');
      setNewPin('');
      setPinConfirmation('');
    } catch (err: any) {
      setPinMsg({ type: 'error', text: err.response?.data?.message || 'Gagal mengubah PIN. Pastikan PIN lama benar.' });
    } finally {
      setLoadingPin(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const handleCopyId = () => {
    if (user?.ipay_id) {
      navigator.clipboard.writeText(user.ipay_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <AppLayout
      userName={user?.name || localStorage.getItem('ipay_user_name') || 'Pengguna'}
      onLogout={handleLogout}
      activeTab="profile"
      onTabChange={(tab) => {
        if (tab === 'home') navigate('/home');
        else if (tab === 'bills') navigate('/bills');
        else if (tab === 'history') navigate('/history');
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Profil & Pengaturan Akun
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Kelola informasi data diri dan PIN keamanan dompet iPay Anda
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Kolom Kiri: Kartu Identitas & Edit Profil */}
        <div className="dashboard-left-column">
          {/* User Info Card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
                  {user?.name || 'Pengguna iPay'}
                </h3>
                <div onClick={handleCopyId} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {user?.ipay_id || 'IPY0000000'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{copied ? '✓ Copied' : '📋'}</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Saldo iPay:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatIDR(user?.balance || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <span>{user?.email || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Nomor HP:</span>
                <span>{user?.phone || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status Akun:</span>
                <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>Aktif / Terverifikasi</span>
              </div>
            </div>
          </div>

          {/* Form Update Profile */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Edit Informasi Profil</h3>

            {profileMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', marginBottom: '16px', background: profileMsg.type === 'success' ? 'var(--secondary-light)' : 'var(--danger-light)', color: profileMsg.type === 'success' ? 'var(--secondary)' : 'var(--danger)', border: `1px solid ${profileMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}` }}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor Handphone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loadingProfile}>
                {loadingProfile ? 'Simpan Perubahan...' : 'Simpan Profil'}
              </button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Ganti PIN Keamanan */}
        <div className="dashboard-right-column">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Ganti PIN Keamanan</h3>

          {pinMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', marginBottom: '16px', background: pinMsg.type === 'success' ? 'var(--secondary-light)' : 'var(--danger-light)', color: pinMsg.type === 'success' ? 'var(--secondary)' : 'var(--danger)', border: `1px solid ${pinMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}` }}>
              {pinMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePin}>
            <div className="form-group">
              <label className="form-label">PIN Lama (6 Digit)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="form-input"
                placeholder="••••••"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">PIN Baru (6 Digit)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="form-input"
                placeholder="••••••"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Konfirmasi PIN Baru</label>
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

            <button type="submit" className="btn-primary" disabled={loadingPin}>
              {loadingPin ? 'Memproses...' : 'Ubah PIN Keamanan'}
            </button>
          </form>

          {/* Logout Button */}
          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button onClick={handleLogout} className="sidebar-btn-logout">
              Keluar Akun iPay
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
