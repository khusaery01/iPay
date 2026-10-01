import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import { AppBar } from '../components/AppBar';
import { CustomButton } from '../components/CustomButton';
import { CustomTextField } from '../components/CustomTextField';
import {
  RequestIcon,
  WalletIcon,
  CheckCircleIcon,
  CopyIcon,
} from '../components/Icons';

export const RequestPayment: React.FC = () => {
  const [toIpayId, setToIpayId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [expiresIn, setExpiresIn] = useState(24);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    message: string;
    payment_code?: string;
    data?: any;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const navigate = useNavigate();

  const expiryOptions = [
    { label: '6 Jam', hours: 6 },
    { label: '12 Jam', hours: 12 },
    { label: '24 Jam (1 Hari)', hours: 24 },
    { label: '48 Jam (2 Hari)', hours: 48 },
  ];

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = toIpayId.trim().toUpperCase();
    if (!cleanId) {
      setErrorMessage('iPay ID pembayar wajib diisi.');
      return;
    }

    const numAmount = parseFloat(amount.replace(/\D/g, ''));
    if (isNaN(numAmount) || numAmount < 1000) {
      setErrorMessage('Nominal tagihan minimal Rp1.000.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/payments/request', {
        to_ipay_id: cleanId,
        amount: numAmount,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        expires_in: expiresIn,
      });

      setCreatedResult(res.data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Gagal membuat tagihan.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <AppLayout activeTab="home">
      <AppBar
        title="Buat Tagihan"
        showBack
        onBack={() => navigate('/home')}
      />

      <div style={{ padding: '20px' }}>
        {createdResult ? (
          /* Success Screen */
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
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

            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A', margin: '0 0 6px 0' }}>
              Tagihan Berhasil Dibuat!
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>
              Tagihan telah dikirimkan ke pembayar. Pembayar dapat melihatnya di menu "Bayar Tagihan" atau membayar menggunakan kode tagihan.
            </p>

            {createdResult.payment_code && (
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1.5px dashed #4F46E5',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                  Kode Pembayaran (6 Digit):
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#4F46E5', letterSpacing: '4px' }}>
                  {createdResult.payment_code}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCode(createdResult.payment_code!)}
                  style={{
                    marginTop: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    backgroundColor: '#EEF2FF',
                    border: 'none',
                    borderRadius: '20px',
                    color: '#4F46E5',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <CopyIcon size={14} />
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Kode Tagihan'}</span>
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <CustomButton
                text="Lihat Daftar Tagihan"
                onClick={() => navigate('/bills')}
              />
              <CustomButton
                text="Kembali ke Beranda"
                isOutlined
                onClick={() => navigate('/home')}
              />
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleCreateRequest}>
            {errorMessage && (
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
                {errorMessage}
              </div>
            )}

            {/* Target iPay ID */}
            <CustomTextField
              label="iPay ID Pembayar (Target)"
              placeholder="Contoh: IPY0000002"
              prefixIcon={<WalletIcon size={18} />}
              value={toIpayId}
              onChange={(e) => setToIpayId(e.target.value)}
              required
            />

            {/* Nominal */}
            <CustomTextField
              label="Nominal Tagihan (Rp)"
              placeholder="Minimal Rp1.000"
              prefixIcon={<RequestIcon size={18} color="#4F46E5" />}
              value={amount}
              onChange={(e) => {
                const numeric = e.target.value.replace(/\D/g, '');
                setAmount(numeric ? parseInt(numeric, 10).toLocaleString('id-ID') : '');
              }}
              required
            />

            {/* Deskripsi */}
            <CustomTextField
              label="Deskripsi / Keperluan Tagihan"
              placeholder="Contoh: Patungan makan siang"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            {/* Catatan Tambahan */}
            <CustomTextField
              label="Catatan Tambahan (Opsional)"
              placeholder="Contoh: Tolong dibayar sebelum sore"
              maxLines={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {/* Masa Berlaku */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                Masa Berlaku Tagihan:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {expiryOptions.map((opt) => {
                  const isSelected = expiresIn === opt.hours;
                  return (
                    <button
                      key={opt.hours}
                      type="button"
                      onClick={() => setExpiresIn(opt.hours)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: `1.5px solid ${isSelected ? '#4F46E5' : '#E2E8F0'}`,
                        backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.08)' : '#FFFFFF',
                        color: isSelected ? '#4F46E5' : '#334155',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <CustomButton
              text="Buat Tagihan Sekarang"
              type="submit"
              isLoading={loading}
            />
          </form>
        )}
      </div>
    </AppLayout>
  );
};

export default RequestPayment;
