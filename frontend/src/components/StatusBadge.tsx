import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  let bgColor = '#E2E8F0';
  let textColor = '#475569';
  let label = status;

  switch (normalized) {
    case 'success':
    case 'accepted':
      bgColor = '#D1FAE5';
      textColor = '#047857';
      label = normalized === 'accepted' ? 'Disetujui' : 'Sukses';
      break;
    case 'pending':
      bgColor = '#FEF3C7';
      textColor = '#B45309';
      label = 'Pending';
      break;
    case 'failed':
    case 'rejected':
      bgColor = '#FEE2E2';
      textColor = '#B91C1C';
      label = normalized === 'rejected' ? 'Ditolak' : 'Gagal';
      break;
    case 'cancelled':
      bgColor = '#E2E8F0';
      textColor = '#475569';
      label = 'Dibatalkan';
      break;
    case 'expired':
      bgColor = '#F1F5F9';
      textColor = '#64748B';
      label = 'Kedaluwarsa';
      break;
    default:
      bgColor = '#E2E8F0';
      textColor = '#475569';
      label = status || '-';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
};
