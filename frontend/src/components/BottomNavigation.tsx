import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, HistoryIcon, QrCodeIcon, UserIcon } from './Icons';

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab = 'home',
  onTabChange,
}) => {
  const navigate = useNavigate();

  const handleNav = (tab: string, path: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    navigate(path);
  };

  const navItems = [
    {
      id: 'home',
      label: 'Beranda',
      path: '/home',
      icon: (active: boolean) => <HomeIcon size={22} color={active ? '#4F46E5' : '#94A3B8'} />,
    },
    {
      id: 'history',
      label: 'Riwayat',
      path: '/history',
      icon: (active: boolean) => <HistoryIcon size={22} color={active ? '#4F46E5' : '#94A3B8'} />,
    },
    {
      id: 'scan',
      label: 'Scan QR',
      path: '/scan',
      icon: (active: boolean) => <QrCodeIcon size={22} color={active ? '#4F46E5' : '#94A3B8'} />,
    },
    {
      id: 'profile',
      label: 'Profil',
      path: '/profile',
      icon: (active: boolean) => <UserIcon size={22} color={active ? '#4F46E5' : '#94A3B8'} />,
    },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        zIndex: 40,
        boxShadow: '0 -2px 10px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '60px',
          maxWidth: '480px',
          margin: '0 auto',
          padding: '0 8px',
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id, item.path)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 0',
                color: isActive ? '#4F46E5' : '#94A3B8',
                fontFamily: 'inherit',
                transition: 'color 0.15s ease',
              }}
            >
              {item.icon(isActive)}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 500,
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
