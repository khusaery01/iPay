import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletIcon, CopyIcon, EyeIcon, EyeOffIcon, TopUpIcon, SendIcon, QrCodeIcon } from './Icons';

interface BalanceCardProps {
  balance: number;
  ipayId: string;
  onTopUpPressed?: () => void;
  onTransferPressed?: () => void;
  onScanPressed?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  ipayId,
  onTopUpPressed,
  onTransferPressed,
  onScanPressed,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    if (ipayId) {
      navigator.clipboard.writeText(ipayId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
        width: '100%',
        padding: '20px',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(79, 70, 229, 0.28)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration elements */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header: iPay ID & Copy button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WalletIcon size={18} color="rgba(255, 255, 255, 0.8)" />
          <span
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              letterSpacing: '0.3px',
              color: '#FFFFFF',
            }}
          >
            iPay ID: {ipayId || '-'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          <CopyIcon size={13} color="#FFFFFF" />
          <span>{copied ? 'Tersalin!' : 'Salin'}</span>
        </button>
      </div>

      {/* Label Saldo & Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '18px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
          Saldo Utama
        </span>
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
          }}
          title={isVisible ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
        >
          {isVisible ? <EyeIcon size={16} /> : <EyeOffIcon size={16} />}
        </button>
      </div>

      {/* Balance Amount */}
      <div
        style={{
          fontSize: '28px',
          fontWeight: 800,
          letterSpacing: '0.5px',
          marginTop: '4px',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {isVisible ? formatRupiah(balance) : '••••••••'}
      </div>

      {/* Quick Action Bar inside Card */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <button
          type="button"
          onClick={onTopUpPressed || (() => navigate('/topup'))}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            border: 'none',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          <TopUpIcon size={16} color="#FFFFFF" />
          <span>Top Up</span>
        </button>

        <button
          type="button"
          onClick={onTransferPressed || (() => navigate('/transfer'))}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            border: 'none',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          <SendIcon size={16} color="#FFFFFF" />
          <span>Transfer</span>
        </button>

        <button
          type="button"
          onClick={onScanPressed || (() => navigate('/scan'))}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            border: 'none',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          <QrCodeIcon size={16} color="#FFFFFF" />
          <span>Scan QR</span>
        </button>
      </div>
    </div>
  );
};
