import React from 'react';
import { TransactionItem } from './TransactionItem';
import type { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  onItemClick?: (transaction: Transaction) => void;
  emptyMessage?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading = false,
  onItemClick,
  emptyMessage = 'Belum ada riwayat transaksi.',
}) => {
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '36px 16px',
          color: '#64748B',
        }}
      >
        <div className="spinner" style={{ width: '28px', height: '28px', marginBottom: '12px' }} />
        <span style={{ fontSize: '13px' }}>Memuat riwayat transaksi...</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '36px 16px',
          color: '#94A3B8',
          fontSize: '13.5px',
          textAlign: 'center',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      {transactions.map((txn, index) => (
        <TransactionItem
          key={txn.id || index}
          transaction={txn}
          onTap={onItemClick ? () => onItemClick(txn) : undefined}
          showDivider={index < transactions.length - 1}
        />
      ))}
    </div>
  );
};
