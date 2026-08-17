import React from 'react';
import { LogoutIcon } from './Icons';

interface HeaderProps {
  userName?: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userName = 'Pengguna', onLogout }) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo-badge">iP</div>
        <div className="header-user-info">
          <span className="header-greeting">Halo, selamat datang</span>
          <span className="header-user-name">{userName}</span>
        </div>
      </div>
      <div className="header-actions">
        <button onClick={onLogout} className="btn-logout" title="Keluar dari akun">
          <LogoutIcon size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
};
