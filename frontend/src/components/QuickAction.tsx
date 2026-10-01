import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SendIcon,
  TopUpIcon,
  ReceiptIcon,
  RequestIcon,
  BoltIcon,
  QrCodeIcon,
} from './Icons';

export interface QuickActionItemData {
  title: string;
  icon: React.ReactNode;
  color: string;
  path?: string;
  onClick?: () => void;
}

interface QuickActionProps {
  onActionClick?: (actionName: string) => void;
}

export const QuickAction: React.FC<QuickActionProps> = ({ onActionClick }) => {
  const navigate = useNavigate();

  const items: QuickActionItemData[] = [
    {
      title: 'Transfer',
      icon: <SendIcon size={22} color="#4F46E5" />,
      color: '#4F46E5',
      path: '/transfer',
    },
    {
      title: 'Top Up',
      icon: <TopUpIcon size={22} color="#10B981" />,
      color: '#10B981',
      path: '/topup',
    },
    {
      title: 'Bayar Tagihan',
      icon: <ReceiptIcon size={22} color="#F59E0B" />,
      color: '#F59E0B',
      path: '/bills',
    },
    {
      title: 'Buat Tagihan',
      icon: <RequestIcon size={22} color="#3B82F6" />,
      color: '#3B82F6',
      path: '/request-payment',
    },
    {
      title: 'Bayar Langsung',
      icon: <BoltIcon size={22} color="#EC4899" />,
      color: '#EC4899',
      path: '/pay-direct',
    },
    {
      title: 'QR Saya',
      icon: <QrCodeIcon size={22} color="#8B5CF6" />,
      color: '#8B5CF6',
      path: '/my-qr',
    },
  ];

  const handleClick = (item: QuickActionItemData) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    } else if (onActionClick) {
      onActionClick(item.title);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: '16px',
      }}
    >
      {items.map((item, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => handleClick(item)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F8FAFC',
            border: '1px solid #F1F5F9',
            borderRadius: '14px',
            padding: '16px 12px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#EEF2FF';
            e.currentTarget.style.borderColor = '#C7D2FE';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F8FAFC';
            e.currentTarget.style.borderColor = '#F1F5F9';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            {item.icon}
          </div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#0F172A',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {item.title}
          </span>
        </button>
      ))}
    </div>
  );
};
