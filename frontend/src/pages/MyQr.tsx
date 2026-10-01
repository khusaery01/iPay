import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import { AppBar } from '../components/AppBar';
import { WalletIcon, CopyIcon } from '../components/Icons';

interface WalletInfo {
  name: string;
  ipay_id: string;
  balance: number;
}

export const MyQr: React.FC = () => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get<WalletInfo>('/wallet');
        setWallet(res.data);
      } catch (err) {
        console.warn('Gagal memuat wallet info:', err);
      }
    };
    fetchWallet();
  }, []);

  const ipayId = wallet?.ipay_id || localStorage.getItem('ipay_user_id') || 'IPY0000001';
  const userName = wallet?.name || localStorage.getItem('ipay_user_name') || 'User iPay';

  const handleCopyId = () => {
    navigator.clipboard.writeText(ipayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout activeTab="home">
      <AppBar
        title="QR Saya"
        showBack
        onBack={() => navigate('/home')}
      />

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* QR Container Card - matches Flutter's 24px borderRadius, 28px padding */}
        <div
          style={{
            width: '100%',
            maxWidth: '360px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            padding: '28px',
            textAlign: 'center',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Header: Wallet Icon + iPay QR (matches Flutter) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WalletIcon size={24} color="#4F46E5" />
            </div>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#0F172A',
              }}
            >
              iPay QR
            </span>
          </div>

          {/* User Name */}
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#0F172A',
              marginBottom: '20px',
            }}
          >
            {userName}
          </div>

          {/* QR Code - Flutter uses 220px, React slightly smaller for web */}
          <div
            style={{
              display: 'inline-block',
              padding: '12px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              marginBottom: '20px',
            }}
          >
            <QRCodeSVG
              value={ipayId}
              size={220}
              level="H"
              includeMargin={false}
              fgColor="#4338CA"
            />
          </div>

          {/* iPay ID Pill - matches Flutter's background + borderRadius(12) */}
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              display: 'inline-block',
            }}
          >
            <span
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                color: '#0F172A',
              }}
            >
              iPay ID: {ipayId}
            </span>
          </div>
        </div>

        {/* Copy Button - matches Flutter CustomButton style */}
        <div style={{ width: '100%', maxWidth: '360px', marginTop: '28px' }}>
          <button
            type="button"
            onClick={handleCopyId}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '14px',
              backgroundColor: '#4F46E5',
              border: 'none',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s ease',
            }}
          >
            <CopyIcon size={18} color="#FFFFFF" />
            <span>{copied ? 'iPay ID Berhasil Disalin!' : 'Salin iPay ID'}</span>
          </button>
        </div>

        <p
          style={{
            fontSize: '13px',
            color: '#64748B',
            textAlign: 'center',
            marginTop: '20px',
            maxWidth: '320px',
            lineHeight: 1.5,
          }}
        >
          Tunjukkan QR ini kepada pengguna iPay lain untuk menerima transfer saldo instan.
        </p>
      </div>
    </AppLayout>
  );
};

export default MyQr;
