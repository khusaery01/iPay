import React from 'react';
import { TopUpIcon, SendIcon, RequestIcon, PayIcon } from './Icons';

interface QuickActionProps {
  onActionClick: (actionName: string) => void;
}

export const QuickAction: React.FC<QuickActionProps> = ({ onActionClick }) => {
  const actions = [
    {
      id: 'topup',
      name: 'Top Up',
      icon: <TopUpIcon size={24} color="#ffffff" />,
      colorClass: 'action-topup',
    },
    {
      id: 'send',
      name: 'Kirim',
      icon: <SendIcon size={24} color="#ffffff" />,
      colorClass: 'action-send',
    },
    {
      id: 'request',
      name: 'Minta',
      icon: <RequestIcon size={24} color="#ffffff" />,
      colorClass: 'action-request',
    },
    {
      id: 'pay',
      name: 'Bayar',
      icon: <PayIcon size={24} color="#ffffff" />,
      colorClass: 'action-pay',
    },
  ];

  return (
    <div className="quick-actions-section">
      <h3 className="section-title">Layanan Cepat</h3>
      <div className="quick-actions-grid">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => onActionClick(act.name)}
            className="action-item"
            title={`Layanan ${act.name}`}
          >
            <div className={`action-icon-wrapper ${act.colorClass}`}>
              {act.icon}
            </div>
            <span className="action-label">{act.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
