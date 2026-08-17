import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, HistoryIcon, QrCodeIcon, RequestIcon, UserIcon } from './Icons';

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab = 'home',
  onTabChange,
}) => {
  const navigate = useNavigate();

  const handleNav = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    if (tab === 'home') {
      navigate('/home');
    } else if (tab === 'history') {
      navigate('/history');
    } else if (tab === 'bills') {
      navigate('/bills');
    } else if (tab === 'profile') {
      navigate('/profile');
    }
  };

  return (
    <nav className="bottom-nav">
      <button
        onClick={() => handleNav('home')}
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <HomeIcon size={22} />
        <span>Beranda</span>
      </button>

      <button
        onClick={() => handleNav('history')}
        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <HistoryIcon size={22} />
        <span>Riwayat</span>
      </button>

      <button
        onClick={() => navigate('/scan')}
        className="nav-item-qr-btn"
        title="Pindai QR iPay"
      >
        <QrCodeIcon size={26} color="#ffffff" />
      </button>

      <button
        onClick={() => handleNav('bills')}
        className={`nav-item ${activeTab === 'bills' ? 'active' : ''}`}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <RequestIcon size={22} />
        <span>Tagihan</span>
      </button>

      <button
        onClick={() => handleNav('profile')}
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <UserIcon size={22} />
        <span>Akun</span>
      </button>
    </nav>
  );
};
