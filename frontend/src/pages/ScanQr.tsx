import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import { AppBar } from '../components/AppBar';
import { CustomButton } from '../components/CustomButton';
import { CustomTextField } from '../components/CustomTextField';
import { PinInputDialog } from '../components/PinInputDialog';
import { SuccessReceiptModal } from '../components/SuccessReceiptModal';
import {
  QrCodeIcon,
  CheckCircleIcon,
} from '../components/Icons';

interface RecipientInfo {
  id?: number;
  name: string;
  ipay_id: string;
  phone?: string | null;
}

export const ScanQr: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [recipient, setRecipient] = useState<RecipientInfo | null>(null);
  const [manualId, setManualId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<{
    message: string;
    transaction_code: string;
    toName: string;
    amount: number;
    new_balance?: number;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

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

  const verifyRecipient = async (ipayId: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get(`/users/check/${ipayId}`);
      if (res.data?.name) {
        setRecipient({
          name: res.data.name,
          ipay_id: ipayId,
          phone: res.data.phone,
        });
        stopCamera();
      } else if (res.data?.data?.name) {
        setRecipient({
          name: res.data.data.name,
          ipay_id: ipayId,
          phone: res.data.data.phone,
        });
        stopCamera();
      } else {
        setError('Penerima dengan iPay ID tersebut tidak ditemukan.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'QR Code tidak valid atau penerima tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      scannerRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      await stopCamera();
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          const parsedId = parseQrPayload(decodedText);
          if (parsedId) {
            verifyRecipient(parsedId);
          } else {
            setError('Format QR tidak dikenali sebagai iPay QR.');
          }
        },
        () => {}
      );
    } catch (err) {
      console.warn('Gagal membuka kamera:', err);
      setError('Kamera tidak dapat diakses atau izin ditolak. Silakan gunakan Input Manual atau Unggah QR.');
      setActiveMode('manual');
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setLoading(true);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      const result = await html5QrCode.scanFile(file, true);
      const parsedId = parseQrPayload(result);
      if (parsedId) {
        verifyRecipient(parsedId);
      } else {
        setError('QR Code pada gambar bukan merupakan QR iPay yang valid.');
      }
    } catch {
      setError('Tidak dapat membaca QR Code dari file gambar ini.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    verifyRecipient(manualId.trim().toUpperCase());
  };

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount.replace(/\D/g, ''));
    if (isNaN(numAmount) || numAmount < 1000) {
      setError('Nominal transfer minimal Rp1.000.');
      return;
    }

    setShowPinDialog(true);
  };

  const handlePinSubmit = async (pin: string) => {
    if (!recipient) return;

    try {
      setIsProcessing(true);
      setError('');
      const numAmount = parseFloat(amount.replace(/\D/g, ''));

      const res = await api.post('/transfers', {
        receiver_ipay_id: recipient.ipay_id,
        amount: numAmount,
        description: description.trim() || undefined,
        pin,
      });

      setShowPinDialog(false);
      setSuccessData({
        message: res.data?.message || 'Transfer berhasil.',
        transaction_code: res.data?.transaction_code || res.data?.transaction?.transaction_code || 'TRX-SUCCESS',
        toName: recipient.name,
        amount: numAmount,
        new_balance: res.data?.new_balance ? parseFloat(res.data.new_balance) : undefined,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Pembayaran via QR gagal.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppLayout activeTab="scan">
      <AppBar
        title="Scan QR Code"
        showBack
        onBack={() => navigate('/home')}
      />

      <div style={{ padding: '20px' }}>
        {/* Step 1: Scanner / Input Selection */}
        {!recipient ? (
          <div>
            {/* Mode Switcher */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '4px',
                marginBottom: '20px',
              }}
            >
              {[
                { id: 'camera', label: 'Kamera' },
                { id: 'upload', label: 'Unggah QR' },
                { id: 'manual', label: 'Manual ID' },
              ].map((mode) => {
                const isSelected = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setError('');
                      setActiveMode(mode.id as any);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isSelected ? '#4F46E5' : 'transparent',
                      color: isSelected ? '#FFFFFF' : '#64748B',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#FEE2E2',
                  color: '#B91C1C',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            {activeMode === 'camera' && (
              <div style={{ textAlign: 'center' }}>
                <div
                  id="qr-reader-container"
                  style={{
                    width: '100%',
                    maxWidth: '320px',
                    margin: '0 auto',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: '#000000',
                    border: '2px solid #4F46E5',
                  }}
                />
                <p style={{ fontSize: '13px', color: '#64748B', marginTop: '14px' }}>
                  Arahkan kamera ke QR Code iPay untuk memindai otomatis.
                </p>
              </div>
            )}

            {activeMode === 'upload' && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '2px dashed #CBD5E1',
                  padding: '36px 20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: '#4F46E5', marginBottom: '12px' }}>
                  <QrCodeIcon size={48} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Pilih Gambar QR Code
                </h4>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 20px 0' }}>
                  Unggah tangkapan layar atau file gambar QR iPay dari galeri perangkat Anda.
                </p>
                <label
                  style={{
                    display: 'inline-block',
                    padding: '10px 24px',
                    backgroundColor: '#4F46E5',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Pilih File Gambar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}

            {activeMode === 'manual' && (
              <form onSubmit={handleManualSubmit}>
                <CustomTextField
                  label="Masukkan iPay ID Tujuan"
                  placeholder="Contoh: IPY0000002"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  required
                />
                <CustomButton
                  text="Periksa & Lanjutkan"
                  type="submit"
                  isLoading={loading}
                />
              </form>
            )}
          </div>
        ) : (
          /* Step 2: Form Bayar/Transfer ke Penerima QR Terverifikasi */
          <form onSubmit={handleStartPayment}>
            {error && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#FEE2E2',
                  color: '#B91C1C',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            {/* Recipient Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#D1FAE5',
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  {recipient.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                      {recipient.name}
                    </span>
                    <CheckCircleIcon size={16} color="#10B981" />
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    iPay ID: {recipient.ipay_id}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setRecipient(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Ganti
                </button>
              </div>
            </div>

            {/* Nominal */}
            <CustomTextField
              label="Nominal Pembayaran / Transfer (Rp)"
              placeholder="Minimal Rp1.000"
              prefixIcon={<span style={{ fontWeight: 'bold', fontSize: '13px' }}>Rp</span>}
              value={amount}
              onChange={(e) => {
                const numeric = e.target.value.replace(/\D/g, '');
                setAmount(numeric ? parseInt(numeric, 10).toLocaleString('id-ID') : '');
              }}
              required
            />

            {/* Catatan */}
            <CustomTextField
              label="Catatan (Opsional)"
              placeholder="Contoh: Pembayaran QR"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div style={{ marginTop: '24px' }}>
              <CustomButton
                text="Lanjutkan Pembayaran"
                type="submit"
              />
            </div>
          </form>
        )}
      </div>

      {/* PIN Dialog */}
      <PinInputDialog
        isOpen={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onSuccess={handlePinSubmit}
        isLoading={isProcessing}
        title="Otorisasi PIN Transaksi QR"
        description={`Masukkan PIN 6-digit iPay Anda untuk membayar ${formatRupiah(
          parseFloat(amount.replace(/\D/g, '') || '0')
        )} kepada ${recipient?.name || 'Penerima'}`}
      />

      {/* Success Receipt Modal */}
      {successData && (
        <SuccessReceiptModal
          isOpen={Boolean(successData)}
          onClose={() => {
            setSuccessData(null);
            navigate('/home');
          }}
          title="Pembayaran QR Berhasil!"
          message={successData.message}
          transactionCode={successData.transaction_code}
          recipientName={successData.toName}
          source="Saldo iPay"
          amount={successData.amount}
          newBalance={successData.new_balance}
          buttonText="Selesai"
        />
      )}
    </AppLayout>
  );
};

export default ScanQr;
