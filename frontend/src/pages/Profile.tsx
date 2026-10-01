import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import { AppBar } from '../components/AppBar';
import { CustomButton } from '../components/CustomButton';
import { CustomTextField } from '../components/CustomTextField';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import {
  UserIcon,
  LockIcon,
  QrCodeIcon,
  LogoutIcon,
  CopyIcon,
  ChevronRightIcon,
  CloseIcon,
} from '../components/Icons';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  ipay_id: string;
  balance: number;
}

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [editError, setEditError] = useState('');

  // Change PIN Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);
  const [pinError, setPinError] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get<UserProfile>('/auth/me');
      setProfile(res.data);
      setEditName(res.data.name);
      setEditEmail(res.data.email);
      setEditPhone(res.data.phone || '');
    } catch {
      try {
        const walletRes = await api.get('/wallet');
        setProfile(walletRes.data);
        setEditName(walletRes.data.name);
        setEditEmail(walletRes.data.email || '');
        setEditPhone(walletRes.data.phone || '');
      } catch (e) {
        console.warn('Gagal memuat profil:', e);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCopyId = () => {
    if (profile?.ipay_id) {
      navigator.clipboard.writeText(profile.ipay_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('ipay_token');
      localStorage.removeItem('ipay_user_name');
      localStorage.removeItem('ipay_user_id');
      navigate('/login');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editName.trim()) {
      setEditError('Nama lengkap wajib diisi.');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      await api.put('/auth/profile', {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim() || undefined,
      });

      setShowEditModal(false);
      showToast('Profil berhasil diperbarui!');
      fetchProfile();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (oldPin.length !== 6 || newPin.length !== 6 || confirmPin.length !== 6) {
      setPinError('Semua PIN harus berupa 6-digit angka.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('PIN baru dan konfirmasi PIN tidak cocok.');
      return;
    }

    try {
      setIsUpdatingPin(true);
      await api.put('/auth/pin', {
        old_pin: oldPin,
        new_pin: newPin,
        new_pin_confirmation: confirmPin,
      });

      setShowPinModal(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      showToast('PIN iPay berhasil diubah!');
    } catch (err: any) {
      setPinError(err.response?.data?.message || 'Gagal mengubah PIN.');
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const userName = profile?.name || localStorage.getItem('ipay_user_name') || 'Pengguna iPay';
  const ipayId = profile?.ipay_id || localStorage.getItem('ipay_user_id') || '-';

  return (
    <AppLayout activeTab="profile">
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          }}
        >
          {toastMessage}
        </div>
      )}

      <AppBar
        title="Profil Saya"
        showBack
        onBack={() => navigate('/home')}
      />

      <div style={{ padding: '20px' }}>
        {/* User Info Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
            marginBottom: '24px',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(79, 70, 229, 0.15)',
              color: '#4F46E5',
              fontSize: '32px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0F172A', margin: '0 0 6px 0' }}>
            {userName}
          </h2>

          {/* iPay ID Pill */}
          <button
            type="button"
            onClick={handleCopyId}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              backgroundColor: 'rgba(79, 70, 229, 0.08)',
              border: 'none',
              borderRadius: '20px',
              color: '#4F46E5',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span>iPay ID: {ipayId}</span>
            <CopyIcon size={14} color="#4F46E5" />
            {copied && <span style={{ fontSize: '11px', color: '#10B981', marginLeft: '4px' }}>✓</span>}
          </button>
        </div>

        {/* Menu List */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            marginBottom: '24px',
          }}
        >
          {/* Edit Profil */}
          <div
            onClick={() => setShowEditModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              cursor: 'pointer',
              borderBottom: '1px solid #F1F5F9',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '14px',
              }}
            >
              <UserIcon size={20} color="#4F46E5" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0F172A' }}>
                Edit Profil
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Ubah nama, email, dan nomor HP
              </div>
            </div>
            <ChevronRightIcon size={20} color="#94A3B8" />
          </div>

          {/* Ganti PIN */}
          <div
            onClick={() => setShowPinModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              cursor: 'pointer',
              borderBottom: '1px solid #F1F5F9',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '14px',
              }}
            >
              <LockIcon size={20} color="#4F46E5" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0F172A' }}>
                Ganti PIN iPay
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Ubah 6-digit PIN keamanan Anda
              </div>
            </div>
            <ChevronRightIcon size={20} color="#94A3B8" />
          </div>

          {/* QR Code */}
          <div
            onClick={() => navigate('/my-qr')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '14px',
              }}
            >
              <QrCodeIcon size={20} color="#4F46E5" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0F172A' }}>
                Tampilkan QR Saya
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Tunjukkan QR Code untuk terima transfer
              </div>
            </div>
            <ChevronRightIcon size={20} color="#94A3B8" />
          </div>
        </div>

        {/* Logout Button */}
        <div
          onClick={() => setShowLogoutConfirm(true)}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '14px',
            }}
          >
            <LogoutIcon size={20} color="#EF4444" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#EF4444' }}>
              Keluar Akun
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Keluar dari aplikasi iPay
            </div>
          </div>
          <ChevronRightIcon size={20} color="#EF4444" />
        </div>
      </div>

      {/* ─── MODAL: Edit Profile ─── */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              boxShadow: '0 -8px 30px rgba(15, 23, 42, 0.15)',
              animation: 'slideUpModal 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>
                Edit Profil
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {editError && (
              <div style={{ padding: '10px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '10px', fontSize: '12.5px', marginBottom: '14px' }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <CustomTextField
                label="Nama Lengkap"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
              <CustomTextField
                label="Email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
              <CustomTextField
                label="Nomor HP"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />

              <div style={{ marginTop: '20px' }}>
                <CustomButton
                  text="Simpan Perubahan"
                  type="submit"
                  isLoading={isUpdatingProfile}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Change PIN ─── */}
      {showPinModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setShowPinModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              boxShadow: '0 -8px 30px rgba(15, 23, 42, 0.15)',
              animation: 'slideUpModal 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>
                Ganti PIN iPay
              </h3>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {pinError && (
              <div style={{ padding: '10px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '10px', fontSize: '12.5px', marginBottom: '14px' }}>
                {pinError}
              </div>
            )}

            <form onSubmit={handleSavePin}>
              <CustomTextField
                label="PIN Saat Ini (6 Digit)"
                type="password"
                maxLength={6}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                required
              />
              <CustomTextField
                label="PIN Baru (6 Digit)"
                type="password"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                required
              />
              <CustomTextField
                label="Konfirmasi PIN Baru"
                type="password"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                required
              />

              <div style={{ marginTop: '20px' }}>
                <CustomButton
                  text="Simpan PIN Baru"
                  type="submit"
                  isLoading={isUpdatingPin}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Keluar dari iPay"
        message="Apakah Anda yakin ingin keluar dari akun ini?"
        confirmText="Keluar"
        isDanger
      />
    </AppLayout>
  );
};

export default Profile;
