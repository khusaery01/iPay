import React from 'react';
import type { Transaction } from '../types';
import { ArrowDownLeftIcon, ArrowUpRightIcon, HistoryIcon } from './Icons';

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, loading = false }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="transaction-list-section">
        <div className="section-title">
          <span>Riwayat Transaksi</span>
        </div>
        <div className="empty-state">
          <p className="empty-state-text">Memuat riwayat transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list-section">
      <div className="section-title">
        <span>Transaksi Terbaru</span>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <HistoryIcon size={32} color="#94a3b8" />
          </div>
          <p className="empty-state-text">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="transaction-items">
          {transactions.map((txn) => {
            const isIncoming = txn.direction === 'in' || txn.type === 'topup';
            return (
              <div key={txn.id} className="transaction-card">
                <div className="txn-left">
                  <div className={`txn-icon-badge ${isIncoming ? 'txn-icon-in' : 'txn-icon-out'}`}>
                    {isIncoming ? <ArrowDownLeftIcon /> : <ArrowUpRightIcon />}
                  </div>
                  <div className="txn-details">
                    <span className="txn-title">
                      {txn.description || (txn.type === 'topup' ? 'Top Up Saldo' : 'Transfer iPay')}
                    </span>
                    <span className="txn-subtitle">{formatDate(txn.created_at)}</span>
                  </div>
                </div>
                <div className="txn-right">
                  <div className={`txn-amount ${isIncoming ? 'txn-amount-in' : 'txn-amount-out'}`}>
                    {isIncoming ? `+${formatCurrency(txn.amount)}` : `-${formatCurrency(txn.amount)}`}
                  </div>
                  <span className={`txn-status status-${txn.status}`}>{txn.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
