import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

interface WalletInfo {
  name: string;
  ipay_id: string;
  balance: number;
}

const MyQr: React.FC = () => {
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

  const ipayId = wallet?.ipay_id || localStorage.getItem('ipay_user_id') || 'IPY0000000';
  const userName = wallet?.name || localStorage.getItem('ipay_user_name') || 'Pengguna iPay';
  
  // Format payload QR Statis sesuai rancangan: ipay://pay?id={ipay_id}&name={display_name}
  const qrPayload = `ipay://pay?id=${ipayId}&name=${encodeURIComponent(userName)}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(ipayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
          >
            ←
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>QR Pembayaran Saya</h2>
        </div>
      </header>

      <main className="app-content" style={{ textAlign: 'center', paddingTop: '20px' }}>
        {/* QR Card Container */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '28px 20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            border: '1px solid var(--border-color)',
            marginBottom: '24px',
          }}
        >
          {/* Header Card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <div className="header-logo-badge" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>iP</div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.3px' }}>
              iPay QR
            </span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            {userName}
          </h3>

          <div
            onClick={handleCopyId}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '6px 14px',
              borderRadius: 'var(--border-radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '22px',
            }}
            title="Klik untuk menyalin iPay ID"
          >
            <span>{ipayId}</span>
            <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{copied ? '✓ Tersalin' : '📋 Salin'}</span>
          </div>

          {/* QR Code SVG */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '16px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '2px dashed var(--border-color)',
              marginBottom: '18px',
            }}
          >
            <QRCodeSVG
              value={qrPayload}
              size={220}
              level="H"
              includeMargin={true}
            />
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Tunjukkan QR ini ke pembeli atau teman untuk menerima pembayaran iPay secara instan.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => navigate('/scan')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>📷 Buka Pemindai (Scan QR)</span>
          </button>
          
          <button
            onClick={() => navigate('/home')}
            style={{
              width: '100%',
              padding: '12px',
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              borderRadius: 'var(--border-radius-md)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Kembali ke Beranda
          </button>
        </div>
      </main>
    </div>
  );
};

export default MyQr;
