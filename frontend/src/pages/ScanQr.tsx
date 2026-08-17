import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';

interface RecipientInfo {
  id: number;
  name: string;
  ipay_id: string;
  phone: string | null;
}

const ScanQr: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [recipient, setRecipient] = useState<RecipientInfo | null>(null);
  const [manualId, setManualId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{
    message: string;
    transaction_code: string;
    to: { name: string; ipay_id: string };
    amount: number;
    new_balance: number;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  // Helper untuk mem-parsing payload QR (ipay://pay?id=... atau raw IPY...)
  const parseQrPayload = (decodedText: string): string | null => {
    try {
      if (decodedText.startsWith('ipay://pay')) {
        const url = new URL(decodedText.replace('ipay://', 'https://dummy.ipay/'));
        const id = url.searchParams.get('id');
        return id ? id.toUpperCase() : null;
      }
      if (decodedText.toUpperCase().startsWith('IPY')) {
        return decodedText.trim().toUpperCase();
      }
      return null;
    } catch {
      return null;
    }
  };

  // Verifikasi iPay ID melalui endpoint backend
  const verifyRecipient = async (ipayId: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get(`/transactions/check-user/${ipayId}`);
      if (res.data?.data) {
        setRecipient(res.data.data);
        stopCamera();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'QR Code tidak valid atau penerima tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  // Inisialisasi Kamera Pemindai
  const startCamera = async () => {
    try {
      if (scannerRef.current) {
        await stopCamera();
      }
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      scannerRef.current = html5QrCode;
      setIsScanning(true);

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
        },
        (decodedText) => {
          const parsedId = parseQrPayload(decodedText);
          if (parsedId) {
            verifyRecipient(parsedId);
          } else {
            setError('Format QR tidak dikenali sebagai iPay QR.');
          }
        },
        () => {
          // Frame error ignore
        }
      );
    } catch (err: any) {
      console.warn('Gagal membuka kamera:', err);
      setIsScanning(false);
      setError('Tidak dapat mengakses kamera. Silakan pilih opsi Unggah Gambar QR atau Input Manual.');
      setActiveMode('manual');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Stop camera error:', e);
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (activeMode === 'camera' && !recipient) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeMode, recipient]);

  // Handle Scan dari Upload Gambar
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setError('');
    setLoading(true);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      const decodedText = await html5QrCode.scanFile(file, true);
      const parsedId = parseQrPayload(decodedText);
      if (parsedId) {
        await verifyRecipient(parsedId);
      } else {
        setError('Format QR tidak dikenali sebagai iPay QR.');
      }
    } catch (err) {
      setError('Gagal membaca QR dari gambar. Pastikan gambar QR jelas.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Eksekusi Pembayaran QR
  const handlePayQr = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 1000) {
      setError('Nominal pembayaran minimal Rp 1.000.');
      return;
    }

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError('PIN harus berupa 6 digit angka.');
      return;
    }

    if (!recipient) {
      setError('Penerima belum terverifikasi.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/transactions/transfer', {
        to_ipay_id: recipient.ipay_id,
        amount: numericAmount,
        description: description || 'Pembayaran via Scan QR',
        pin,
      });

      setSuccessData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pembayaran QR gagal. Periksa saldo atau PIN Anda.');
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  // ─── TAMPILAN STRUK SUKSES ──────────────────────────────────
  if (successData) {
    return (
      <div className="app-container">
        <div className="app-content" style={{ textAlign: 'center', paddingTop: '40px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '8px' }}>
            Pembayaran QR Sukses!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
            Transaksi Anda telah berhasil diproses ke penerima.
          </p>

          <div style={{ background: 'var(--bg-muted)', padding: '20px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kode Transaksi:</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{successData.transaction_code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Dibayarkan Kepada:</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {successData.to.name} ({successData.to.ipay_id})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Metode:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>Scan QR (Saldo iPay)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Dibayar:</span>
              <span style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '1.05rem' }}>
                -{formatIDR(successData.amount)}
              </span>
            </div>
          </div>

          <button onClick={() => navigate('/home')} className="btn-primary">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              if (recipient) {
                setRecipient(null);
              } else {
                navigate('/home');
              }
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
          >
            ←
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {recipient ? 'Konfirmasi Pembayaran QR' : 'Pindai QR iPay'}
          </h2>
        </div>
      </header>

      <main className="app-content">
        {error && <div className="alert-error">{error}</div>}

        {/* ─── STEP 1: SCANNING / INPUT MODE ───────────────────────── */}
        {!recipient ? (
          <div>
            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setActiveMode('camera')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--border-radius-md)',
                  border: activeMode === 'camera' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: activeMode === 'camera' ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: activeMode === 'camera' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                📷 Kamera
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('upload')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--border-radius-md)',
                  border: activeMode === 'upload' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: activeMode === 'upload' ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: activeMode === 'upload' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                🖼️ Upload QR
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('manual')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--border-radius-md)',
                  border: activeMode === 'manual' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: activeMode === 'manual' ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: activeMode === 'manual' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                ⌨️ Input ID
              </button>
            </div>

            {/* Viewport Scanner Container */}
            <div
              id="qr-reader-container"
              style={{
                width: '100%',
                minHeight: activeMode === 'camera' ? '300px' : '0px',
                borderRadius: '16px',
                overflow: 'hidden',
                background: activeMode === 'camera' ? '#0f172a' : 'transparent',
                display: activeMode === 'camera' ? 'block' : 'none',
                marginBottom: '16px',
              }}
            />

            {activeMode === 'camera' && (
              <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Arahkan kamera ke QR Code iPay penerima
              </p>
            )}

            {/* Mode Upload File */}
            {activeMode === 'upload' && (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: 'var(--bg-muted)',
                  border: '2px dashed var(--border-color)',
                  borderRadius: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🖼️</div>
                <label className="btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '10px 20px', cursor: 'pointer' }}>
                  Pilih Gambar QR dari Galeri
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}

            {/* Mode Manual Input */}
            {activeMode === 'manual' && (
              <div style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Masukkan iPay ID Penerima</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: IPY0000002"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value.toUpperCase())}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => verifyRecipient(manualId)}
                  className="btn-primary"
                  disabled={loading || !manualId}
                >
                  {loading ? 'Memverifikasi...' : 'Verifikasi Penerima'}
                </button>
              </div>
            )}

            {/* Shortcut ke QR Saya */}
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button
                type="button"
                onClick={() => navigate('/my-qr')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                📲 Tampilkan QR Pembayaran Saya
              </button>
            </div>
          </div>
        ) : (
          /* ─── STEP 2: CONFIRMATION & PIN PAYMENT FORM ────────────── */
          <form onSubmit={handlePayQr}>
            {/* Recipient Profile Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                border: '1.5px solid #c7d2fe',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Penerima Terverifikasi
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                {recipient.name}
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {recipient.ipay_id} {recipient.phone ? `• ${recipient.phone}` : ''}
              </span>
            </div>

            {/* Input Nominal */}
            <div className="form-group">
              <label className="form-label">Nominal Pembayaran (Rp)</label>
              <input
                type="number"
                min="1000"
                max="50000000"
                step="1000"
                className="form-input"
                placeholder="Minimal Rp 1.000"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                required
                autoFocus
              />
            </div>

            {/* Catatan Opsional */}
            <div className="form-group">
              <label className="form-label">Catatan / Keterangan (Opsional)</label>
              <input
                type="text"
                maxLength={255}
                className="form-input"
                placeholder="Contoh: Pembayaran makan siang"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Input PIN */}
            <div className="form-group">
              <label className="form-label">PIN Keamanan Anda (6 Digit)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="form-input"
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !amount || pin.length !== 6}
            >
              {loading ? 'Memproses Transaksi...' : `Konfirmasi Bayar ${amount ? formatIDR(Number(amount)) : ''}`}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default ScanQr;
