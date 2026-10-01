import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import { PinInputDialog } from '../components/PinInputDialog';
import { SuccessReceiptModal } from '../components/SuccessReceiptModal';
import {
  BoltIcon,
  WalletIcon,
  BuildingIcon,
  CreditCardIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from '../components/Icons';

export const PayDirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialIpayId = searchParams.get('ipay_id') || '';

  const [payerIpayId, setPayerIpayId] = useState(initialIpayId);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSource, setSelectedSource] = useState('ipay');
  const [simulatedStatus] = useState<'success' | 'failed'>('success');

  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [userCheckError, setUserCheckError] = useState<string | null>(null);

  const [showPinDialog, setShowPinDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [successResult, setSuccessResult] = useState<{
    res: any;
    amount: number;
    source: string;
    payerName?: string;
  } | null>(null);

  const navigate = useNavigate();

  const quickAmounts = [10000, 25000, 50000, 100000, 250000, 500000];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCheckUser = async (idToCheck: string) => {
    const cleanId = idToCheck.trim().toUpperCase();
    if (!cleanId) return;

    setIsCheckingUser(true);
    setUserCheckError(null);
    setVerifiedName(null);

    try {
      const res = await api.get(`/transactions/check-user/${cleanId}`);
      if (res.data?.data?.name) {
        setVerifiedName(res.data.data.name);
      } else if (res.data?.name) {
        setVerifiedName(res.data.name);
      } else {
        setUserCheckError('iPay ID pembeli tidak ditemukan.');
      }
    } catch (err: any) {
      setUserCheckError(err.response?.data?.message || 'iPay ID pembeli tidak ditemukan.');
    } finally {
      setIsCheckingUser(false);
    }
  };

  useEffect(() => {
    if (initialIpayId) {
      setPayerIpayId(initialIpayId.toUpperCase());
      handleCheckUser(initialIpayId);
    }
  }, [initialIpayId]);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = payerIpayId.trim();
    if (!cleanId) {
      setErrorMessage('iPay ID pembeli wajib diisi.');
      return;
    }

    const numAmount = parseFloat(amount.replace(/\D/g, ''));
    if (isNaN(numAmount) || numAmount < 1000) {
      setErrorMessage('Nominal pembayaran minimal Rp1.000.');
      return;
    }

    setShowPinDialog(true);
  };

  const handleConfirmPayWithPin = async (pin: string) => {
    try {
      setIsProcessing(true);
      setShowPinDialog(false);
      setErrorMessage(null);

      const numAmount = parseFloat(amount.replace(/\D/g, ''));
      const res = await api.post('/payments/pay-direct', {
        payer_ipay_id: payerIpayId.trim().toUpperCase(),
        amount: numAmount,
        description: description.trim() || undefined,
        pin,
        source: selectedSource,
        simulated_status: simulatedStatus,
      });

      setSuccessResult({
        res: res.data,
        amount: numAmount,
        source: selectedSource,
        payerName: verifiedName || payerIpayId,
      });
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Pembayaran langsung gagal dilakukan.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppLayout activeTab="pay-direct">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Web Header Banner */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#FCE7F3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BoltIcon size={28} color="#EC4899" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Bayar Langsung (Direct Pay)
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
              Proses transaksi pembayaran langsung dari pembeli menggunakan iPay ID dan otorisasi PIN 6-digit.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '12px',
              color: '#B91C1C',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircleIcon size={18} color="#B91C1C" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Card */}
        <form
          onSubmit={handleSubmitForm}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {/* Target iPay ID Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              iPay ID Pembeli
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={payerIpayId}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setPayerIpayId(val);
                  setVerifiedName(null);
                  setUserCheckError(null);
                }}
                onBlur={() => handleCheckUser(payerIpayId)}
                placeholder="Contoh: IPY1234567"
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #E2E8F0',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0F172A',
                  outline: 'none',
                  fontFamily: 'inherit',
                  textTransform: 'uppercase',
                }}
              />
              <button
                type="button"
                onClick={() => handleCheckUser(payerIpayId)}
                disabled={isCheckingUser || !payerIpayId.trim()}
                style={{
                  padding: '0 18px',
                  backgroundColor: '#EEF2FF',
                  color: '#4F46E5',
                  border: '1px solid #C7D2FE',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {isCheckingUser ? 'Mengecek...' : 'Cek User'}
              </button>
            </div>

            {/* Recipient verification state */}
            {verifiedName && (
              <div
                style={{
                  marginTop: '10px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#047857',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <CheckCircleIcon size={16} color="#047857" />
                <span>Terverifikasi: <strong>{verifiedName}</strong></span>
              </div>
            )}
            {userCheckError && (
              <div style={{ marginTop: '8px', color: '#DC2626', fontSize: '12px', fontWeight: 600 }}>
                {userCheckError}
              </div>
            )}
          </div>

          {/* Nominal Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Nominal Pembayaran (Rp)
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (!val) {
                  setAmount('');
                  return;
                }
                setAmount(formatRupiah(parseInt(val, 10)));
              }}
              placeholder="0"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                fontSize: '18px',
                fontWeight: 800,
                color: '#0F172A',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />

            {/* Preset chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(formatRupiah(q))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {formatRupiah(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Description Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Deskripsi / Catatan (Opsional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Pembayaran belanja merchant"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Source Selection */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
              Pilih Sumber Dana
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              {[
                { id: 'ipay', label: 'Saldo iPay', icon: WalletIcon, color: '#4F46E5' },
                { id: 'gopay', label: 'GoPay', icon: BoltIcon, color: '#00AED6' },
                { id: 'dana', label: 'DANA', icon: CreditCardIcon, color: '#118EEA' },
                { id: 'bca', label: 'BCA VA', icon: BuildingIcon, color: '#0060AF' },
              ].map((src) => {
                const selected = selectedSource === src.id;
                const IconComponent = src.icon;
                return (
                  <div
                    key={src.id}
                    onClick={() => setSelectedSource(src.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: selected ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                      backgroundColor: selected ? '#EEF2FF' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <IconComponent size={20} color={src.color} />
                    <span style={{ fontSize: '13px', fontWeight: selected ? 700 : 500, color: '#0F172A' }}>
                      {src.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#4F46E5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              fontFamily: 'inherit',
            }}
          >
            {isProcessing ? 'Memproses Pembayaran...' : 'Lanjutkan Ke Otentikasi PIN'}
          </button>
        </form>

        {/* PIN Input Dialog */}
        <PinInputDialog
          isOpen={showPinDialog}
          onClose={() => setShowPinDialog(false)}
          onSuccess={handleConfirmPayWithPin}
          title="Otorisasi PIN Pembeli"
          description={`Masukkan 6-digit PIN iPay untuk memverifikasi pembayaran sebesar ${amount}`}
        />

        {/* Success Receipt Modal */}
        <SuccessReceiptModal
          isOpen={!!successResult}
          onClose={() => {
            setSuccessResult(null);
            navigate('/home');
          }}
          title="Pembayaran Langsung Berhasil!"
          message="Transaksi telah sukses diproses dan tercatat di riwayat."
          transactionCode={successResult?.res?.transaction_code}
          recipientName={successResult?.payerName || payerIpayId}
          source={successResult?.source || 'ipay'}
          amount={successResult?.amount || 0}
          newBalance={successResult?.res?.new_balance ? parseFloat(successResult.res.new_balance) : null}
        />
      </div>
    </AppLayout>
  );
};

export default PayDirect;
