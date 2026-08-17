import React from 'react';

interface BalanceCardProps {
  balance: number;
  ipayId: string;
  onRefresh?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance, ipayId }) => {
  const formattedBalance = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(balance);

  return (
    <div className="balance-card">
      <div className="balance-card-header">
        <span className="balance-label">Saldo Aktif</span>
        <div className="ipay-id-badge">{ipayId || 'IPY-MEMBER'}</div>
      </div>
      <div className="balance-amount">{formattedBalance}</div>
      <div className="balance-card-footer">
        <span>Dompet Digital iPay</span>
        <span>Terproteksi PIN</span>
      </div>
    </div>
  );
};
