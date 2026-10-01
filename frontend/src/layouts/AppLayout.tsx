import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  HomeIcon,
  SendIcon,
  TopUpIcon,
  ReceiptIcon,
  BoltIcon,
  RequestQuoteIcon,
  QrCodeIcon,
  HistoryIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  CopyIcon,
  WalletIcon,
} from '../components/Icons';

interface AppLayoutProps {
  activeTab?: string;
  children: React.ReactNode;
  showNav?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab = 'home',
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userIpayId, setUserIpayId] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const cachedName = localStorage.getItem('ipay_user_name') || 'User iPay';
    const cachedId = localStorage.getItem('ipay_user_id') || '';
    setUserName(cachedName);
    setUserIpayId(cachedId);

    // Fetch latest user & balance quietly
    api.get('/wallet').then((res) => {
      if (res.data) {
        if (res.data.name) setUserName(res.data.name);
        if (res.data.ipay_id) {
          setUserIpayId(res.data.ipay_id);
          localStorage.setItem('ipay_user_id', res.data.ipay_id);
        }
        if (typeof res.data.balance === 'number') {
          setBalance(res.data.balance);
        }
      }
    }).catch(() => {
      // Ignore quiet fetch errors
    });
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // ignore
    } finally {
      localStorage.removeItem('ipay_token');
      localStorage.removeItem('ipay_user_name');
      localStorage.removeItem('ipay_user_id');
      navigate('/login');
    }
  };

  const handleCopyIpayId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userIpayId) return;
    navigator.clipboard.writeText(userIpayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'home', label: 'Dashboard', path: '/home', icon: HomeIcon },
    { id: 'transfer', label: 'Transfer Saldo', path: '/transfer', icon: SendIcon },
    { id: 'topup', label: 'Top Up Saldo', path: '/topup', icon: TopUpIcon },
    { id: 'bills', label: 'Bayar Tagihan', path: '/bills', icon: ReceiptIcon },
    { id: 'pay-direct', label: 'Bayar Langsung', path: '/pay-direct', icon: BoltIcon },
    { id: 'request-payment', label: 'Buat Tagihan', path: '/request-payment', icon: RequestQuoteIcon },
    { id: 'qr', label: 'Kode QR Saya', path: '/my-qr', icon: QrCodeIcon },
    { id: 'history', label: 'Riwayat Transaksi', path: '/history', icon: HistoryIcon },
    { id: 'profile', label: 'Profil Saya', path: '/profile', icon: UserIcon },
  ];

  const currentPath = location.pathname;
  const isItemActive = (itemId: string, itemPath: string) => {
    if (activeTab === itemId) return true;
    if (currentPath === itemPath) return true;
    if (itemId === 'qr' && (currentPath === '/my-qr' || currentPath === '/scan')) return true;
    if (itemId === 'bills' && (currentPath === '/bills' || currentPath === '/pay-bills' || currentPath.startsWith('/pay/'))) return true;
    return false;
  };

  const initialLetter = userName.charAt(0).toUpperCase() || 'U';

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* ─── DESKTOP SIDEBAR ────────────────────────────────────────── */}
      <aside
        className="desktop-sidebar"
        style={{
          width: '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 20px 16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              color: '#FFFFFF',
            }}
          >
            <WalletIcon size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              iPay <span style={{ fontSize: '11px', color: '#4F46E5', backgroundColor: '#EEF2FF', padding: '2px 6px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0' }}>Web</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '-2px' }}>
              E-Wallet Solution
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 12px 8px 12px' }}>
            Menu Utama
          </div>
          {navItems.map((item) => {
            const active = isItemActive(item.id, item.path);
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: active ? '#EEF2FF' : 'transparent',
                  color: active ? '#4F46E5' : '#475569',
                  fontWeight: active ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '4px',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
              >
                <IconComponent size={20} color={active ? '#4F46E5' : '#64748B'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom User Card */}
        <div style={{ padding: '16px', borderTop: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {initialLetter}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userName}
              </div>
              {userIpayId && (
                <div
                  onClick={handleCopyIpayId}
                  title="Klik untuk salin iPay ID"
                  style={{
                    fontSize: '11px',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <span>{userIpayId}</span>
                  <CopyIcon size={12} color="#64748B" />
                  {copied && <span style={{ color: '#059669', fontSize: '10px', fontWeight: 600 }}>Tersalin!</span>}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#DC2626',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background-color 0.15s ease',
            }}
          >
            <LogoutIcon size={16} color="#DC2626" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ──────────────────────────────────────── */}
      <div
        className="main-layout-wrapper"
        style={{
          flex: 1,
          marginLeft: '260px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: 'calc(100% - 260px)',
        }}
      >
        {/* Top Header Navbar */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile Hamburger toggle */}
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                borderRadius: '8px',
              }}
            >
              <MenuIcon size={24} color="#0F172A" />
            </button>

            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
              {navItems.find((n) => isItemActive(n.id, n.path))?.label || 'iPay Web Portal'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {balance !== null && (
              <div
                onClick={() => navigate('/home')}
                style={{
                  backgroundColor: '#F1F5F9',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <WalletIcon size={16} color="#4F46E5" />
                <span>Saldo: <strong style={{ color: '#4F46E5' }}>{formatRupiah(balance)}</strong></span>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/scan')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)',
                fontFamily: 'inherit',
              }}
            >
              <QrCodeIcon size={18} color="#FFFFFF" />
              <span className="hide-mobile">Scan QR</span>
            </button>
          </div>
        </header>

        {/* ─── MOBILE DRAWER MENU ───────────────────────────────────── */}
        {isMobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              zIndex: 50,
              display: 'flex',
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              style={{
                width: '280px',
                backgroundColor: '#FFFFFF',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>iPay Menu</div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <CloseIcon size={24} color="#64748B" />
                </button>
              </div>

              <nav style={{ flex: 1, overflowY: 'auto' }}>
                {navItems.map((item) => {
                  const active = isItemActive(item.id, item.path);
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: active ? '#EEF2FF' : 'transparent',
                        color: active ? '#4F46E5' : '#475569',
                        fontWeight: active ? 700 : 500,
                        fontSize: '14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginBottom: '4px',
                        fontFamily: 'inherit',
                      }}
                    >
                      <IconComponent size={20} color={active ? '#4F46E5' : '#64748B'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  marginTop: '16px',
                }}
              >
                <LogoutIcon size={18} color="#DC2626" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content Container */}
        <main
          className="desktop-layout-container"
          style={{
            flex: 1,
            padding: '24px',
            maxWidth: '1280px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
