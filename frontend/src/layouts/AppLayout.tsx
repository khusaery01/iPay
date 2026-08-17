import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';
import { HomeIcon, RequestIcon, QrCodeIcon, HistoryIcon, UserIcon, LogoutIcon } from '../components/Icons';

interface AppLayoutProps {
  userName?: string;
  onLogout?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  children: React.ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  userName,
  onLogout = () => {},
  activeTab = 'home',
  onTabChange,
  children,
  showHeader = true,
  showNav = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="desktop-layout-container">
      {/* Sidebar - Desktop Only */}
      <aside className="app-sidebar stagger-dashboard-item" style={{ animationDelay: '0ms' }}>
        <div className="sidebar-brand" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
          <div className="header-logo-badge">iP</div>
          <span className="sidebar-brand-name">iPay</span>
        </div>

        <div className="sidebar-user">
          <span className="sidebar-greeting">Selamat datang,</span>
          <span className="sidebar-username">{userName || 'Pengguna'}</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/home" className={`sidebar-link ${activeTab === 'home' ? 'active' : ''}`}>
            <HomeIcon size={20} />
            <span>Beranda</span>
          </Link>
          <Link to="/history" className={`sidebar-link ${activeTab === 'history' ? 'active' : ''}`}>
            <HistoryIcon size={20} />
            <span>Riwayat Transaksi</span>
          </Link>
          <Link to="/bills" className={`sidebar-link ${activeTab === 'bills' ? 'active' : ''}`}>
            <RequestIcon size={20} />
            <span>Tagihan Masuk</span>
          </Link>
          <Link to="/scan" className={`sidebar-link ${activeTab === 'scan' ? 'active' : ''}`}>
            <QrCodeIcon size={20} />
            <span>Scan QR</span>
          </Link>
          <Link to="/my-qr" className={`sidebar-link ${activeTab === 'my-qr' ? 'active' : ''}`}>
            <QrCodeIcon size={20} />
            <span>QR Saya</span>
          </Link>
          <Link to="/pay-direct" className={`sidebar-link ${activeTab === 'pay-direct' ? 'active' : ''}`}>
            <span style={{ fontSize: '1.1rem', marginRight: '2px' }}>⚡</span>
            <span>Pay Direct</span>
          </Link>
          <Link to="/profile" className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}>
            <UserIcon size={20} />
            <span>Profil Akun</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="sidebar-btn-logout">
            <LogoutIcon size={18} />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-layout-area">
        {showHeader && (
          <header className="desktop-header stagger-dashboard-item" style={{ animationDelay: '40ms' }}>
            <div className="mobile-header-brand" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
              <div className="header-logo-badge" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>iP</div>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>iPay</span>
            </div>
            
            <div className="desktop-header-user-info">
              <span>Halo, <strong>{userName || 'Pengguna'}</strong></span>
              <button onClick={onLogout} className="btn-logout-header" title="Keluar dari akun">
                <LogoutIcon size={16} />
              </button>
            </div>
          </header>
        )}

        <main className="app-content">
          {children}
        </main>

        {showNav && (
          <div className="mobile-bottom-nav">
            <BottomNavigation
              activeTab={activeTab}
              onTabChange={onTabChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
