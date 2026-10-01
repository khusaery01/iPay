import React from 'react';
import { CheckCircleIcon } from './Icons';
import { CustomButton } from './CustomButton';

interface SuccessReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  transactionCode?: string;
  recipientName?: string;
  source?: string;
  amount: number;
  newBalance?: number | null;
  buttonText?: string;
}

export const SuccessReceiptModal: React.FC<SuccessReceiptModalProps> = ({
  isOpen,
  onClose,
  title = 'Pembayaran Berhasil!',
  message = 'Transaksi telah berhasil diproses.',
  transactionCode,
  recipientName,
  source = 'IPAY',
  amount,
  newBalance,
  buttonText = 'Selesai',
}) => {
  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
          textAlign: 'center',
          animation: 'scaleUpDialog 0.2s ease-out',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#D1FAE5',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}
        >
          <CheckCircleIcon size={38} />
        </div>

        <h3
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#0F172A',
            margin: '0 0 4px 0',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '12.5px',
            color: '#64748B',
            margin: '0 0 20px 0',
            lineHeight: 1.4,
          }}
        >
          {message}
        </p>

        {/* Receipt Card */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '20px',
            textAlign: 'left',
            fontSize: '12.5px',
            border: '1px solid #E2E8F0',
          }}
        >
          {transactionCode && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#64748B' }}>Kode Transaksi</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{transactionCode}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '8px 0' }} />
            </>
          )}

          {recipientName && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#64748B' }}>Penerima / Kepada</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{recipientName}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '8px 0' }} />
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ color: '#64748B' }}>Sumber Dana</span>
            <span style={{ fontWeight: 600, color: '#0F172A' }}>{source.toUpperCase()}</span>
          </div>
          <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '8px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ color: '#64748B' }}>Jumlah Pembayaran</span>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#10B981' }}>
              {formatRupiah(amount)}
            </span>
          </div>

          {newBalance !== undefined && newBalance !== null && (
            <>
              <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#64748B' }}>Sisa Saldo iPay</span>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#4F46E5' }}>
                  {formatRupiah(newBalance)}
                </span>
              </div>
            </>
          )}
        </div>

        <CustomButton
          text={buttonText}
          onClick={onClose}
        />
      </div>
    </div>
  );
};
