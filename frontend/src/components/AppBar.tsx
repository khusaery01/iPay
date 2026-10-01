import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBackIcon } from './Icons';

interface AppBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  tabs?: { label: string; active: boolean; onClick: () => void }[];
}

export const AppBar: React.FC<AppBarProps> = ({
  title,
  showBack = true,
  onBack,
  actions,
  tabs,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/home');
      }
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        marginBottom: '20px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Kembali"
              style={{
                background: '#F1F5F9',
                border: 'none',
                cursor: 'pointer',
                color: '#0F172A',
                padding: '8px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease',
              }}
            >
              <ArrowBackIcon size={20} />
            </button>
          )}
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#0F172A',
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>

        {actions && <div>{actions}</div>}
      </div>

      {tabs && tabs.length > 0 && (
        <div
          style={{
            display: 'flex',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              type="button"
              onClick={tab.onClick}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: `2.5px solid ${tab.active ? '#4F46E5' : 'transparent'}`,
                color: tab.active ? '#4F46E5' : '#64748B',
                fontWeight: tab.active ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
