import React from 'react';
import {
  TopUpIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PayIcon,
} from './Icons';
import { StatusBadge } from './StatusBadge';
import type { Transaction } from '../types';

interface TransactionItemProps {
  transaction: Transaction;
  onTap?: () => void;
  showDivider?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onTap,
  showDivider = false,
}) => {
  const isIncome = transaction.direction === 'in' || transaction.type === 'topup';
  const sign = isIncome ? '+' : '-';
  const amountColor = isIncome ? '#10B981' : '#0F172A';

  let iconElement: React.ReactNode;
  let iconBg = 'rgba(79, 70, 229, 0.1)';
  let iconColor = '#4F46E5';
  let title = transaction.description || 'Transaksi';

  if (transaction.type === 'topup') {
    iconColor = '#10B981';
    iconBg = 'rgba(16, 185, 129, 0.12)';
    iconElement = <TopUpIcon size={20} color={iconColor} />;
    title = 'Top Up iPay';
  } else if (transaction.type === 'transfer') {
    if (isIncome) {
      iconColor = '#10B981';
      iconBg = 'rgba(16, 185, 129, 0.12)';
      iconElement = <ArrowDownLeftIcon size={20} color={iconColor} />;
      title = transaction.sender?.name ? `Dari ${transaction.sender.name}` : 'Transfer Masuk';
    } else {
      iconColor = '#4F46E5';
      iconBg = 'rgba(79, 70, 229, 0.12)';
      iconElement = <ArrowUpRightIcon size={20} color={iconColor} />;
      title = transaction.receiver?.name ? `Ke ${transaction.receiver.name}` : 'Transfer Keluar';
    }
  } else {
    iconColor = '#7C3AED';
    iconBg = 'rgba(124, 58, 237, 0.12)';
    iconElement = <PayIcon size={20} color={iconColor} />;
    title = transaction.description || 'Pembayaran';
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div
        onClick={onTap}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          cursor: onTap ? 'pointer' : 'default',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (onTap) e.currentTarget.style.backgroundColor = '#F8FAFC';
        }}
        onMouseLeave={(e) => {
          if (onTap) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginRight: '14px',
          }}
        >
          {iconElement}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#0F172A',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            {formatDate(transaction.created_at)}
          </div>
        </div>

        {/* Amount & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: amountColor,
            }}
          >
            {sign} {formatRupiah(transaction.amount)}
          </div>
          <div style={{ marginTop: '4px' }}>
            <StatusBadge status={transaction.status} />
          </div>
        </div>
      </div>

      {showDivider && (
        <div
          style={{
            height: '1px',
            backgroundColor: '#F1F5F9',
            marginLeft: '70px',
          }}
        />
      )}
    </>
  );
};
