import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import { AppBar } from '../components/AppBar';
import { CustomButton } from '../components/CustomButton';
import { CustomTextField } from '../components/CustomTextField';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { PinInputDialog } from '../components/PinInputDialog';
import { SuccessReceiptModal } from '../components/SuccessReceiptModal';
import {
  WalletIcon,
  CheckCircleIcon,
} from '../components/Icons';

export const Transfer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialIpayId = searchParams.get('ipay_id') || '';

  const [targetIpayId, setTargetIpayId] = useState(initialIpayId);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const [recipient, setRecipient] = useState<{ name: string; ipay_id: string; email?: string } | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [userCheckError, setUserCheckError] = useState<string | null>(null);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [successData, setSuccessData] = useState<{
    res: any;
    amount: number;
    recipientName?: string;
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
    setRecipient(null);

    try {
      const res = await api.get(`/users/check/${cleanId}`);
      if (res.data && res.data.name) {
        setRecipient({
          name: res.data.name,
          ipay_id: cleanId,
          email: res.data.email,
        });
        setUserCheckError(null);
      } else if (res.data?.data?.name) {
        setRecipient({
          name: res.data.data.name,
          ipay_id: cleanId,
          email: res.data.data.email,
        });
        setUserCheckError(null);
      } else {
        setUserCheckError('iPay ID penerima tidak ditemukan.');
      }
    } catch (err: any) {
      setUserCheckError(err.response?.data?.message || 'iPay ID penerima tidak ditemukan.');
    } finally {
      setIsCheckingUser(false);
    }
  };

  useEffect(() => {
    if (initialIpayId) {
      setTargetIpayId(initialIpayId.toUpperCase());
      handleCheckUser(initialIpayId);
    }
  }, [initialIpayId]);

  const handleStartTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = targetIpayId.trim();
    if (!cleanId) {
      setErrorMessage('iPay ID penerima wajib diisi.');
      return;
    }

    const numAmount = parseFloat(amount.replace(/\D/g, ''));
    if (isNaN(numAmount) || numAmount < 1000) {
      setErrorMessage('Minimal transfer adalah Rp1.000.');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleProceedToPin = () => {
    setShowConfirmDialog(false);
    setShowPinDialog(true);
  };

  const handlePinSubmit = async (pin: string) => {
    try {
      setIsTransferring(true);
      setErrorMessage(null);

      const numAmount = parseFloat(amount.replace(/\D/g, ''));
      const payload = {
        receiver_ipay_id: targetIpayId.trim().toUpperCase(),
        amount: numAmount,
        description: description.trim() || undefined,
        pin,
      };

      const res = await api.post('/transfers', payload);
      setShowPinDialog(false);

      setSuccessData({
        res: res.data,
        amount: numAmount,
        recipientName: recipient?.name || targetIpayId,
      });
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Transfer saldo gagal.');
    } finally {
      setIsTransferring(false);
    }
  };

  const numAmount = parseFloat(amount.replace(/\D/g, '') || '0');

  return (
    <AppLayout activeTab="home">
      <AppBar
        title="Transfer Saldo"
        showBack
        onBack={() => navigate('/home')}
      />

      <div style={{ padding: '20px' }}>
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

        <form onSubmit={handleStartTransfer}>
          {/* Target iPay ID Input */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <CustomTextField
                label="iPay ID Penerima"
                placeholder="Contoh: IPY0000002"
                prefixIcon={<WalletIcon size={18} />}
                value={targetIpayId}
                onChange={(e) => {
                  setTargetIpayId(e.target.value);
                  if (recipient || userCheckError) {
                    setRecipient(null);
                    setUserCheckError(null);
                  }
                }}
                errorText={userCheckError}
                style={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ paddingTop: '24px' }}>
              <button
                type="button"
                onClick={() => handleCheckUser(targetIpayId)}
                disabled={isCheckingUser || !targetIpayId.trim()}
                style={{
                  height: '48px',
                  padding: '0 16px',
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: isCheckingUser || !targetIpayId.trim() ? 'not-allowed' : 'pointer',
                  opacity: isCheckingUser || !targetIpayId.trim() ? 0.6 : 1,
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isCheckingUser ? (
                  <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#FFFFFF' }} />
                ) : (
                  'Cek ID'
                )}
              </button>
            </div>
          </div>

          {/* Verified Recipient Card */}
          {recipient && (
            <div
              style={{
                marginTop: '10px',
                marginBottom: '16px',
                padding: '12px 14px',
                backgroundColor: '#D1FAE5',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <CheckCircleIcon size={20} color="#10B981" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#047857' }}>
                  {recipient.name}
                </div>
                <div style={{ fontSize: '12px', color: '#065F46' }}>
                  {recipient.ipay_id} {recipient.email ? `• ${recipient.email}` : ''}
                </div>
              </div>
            </div>
          )}

          {/* Nominal Input */}
          <div style={{ marginTop: '16px' }}>
            <CustomTextField
              label="Nominal Transfer (Rp)"
              placeholder="Minimal Rp1.000"
              prefixIcon={<span style={{ fontWeight: 'bold', fontSize: '13px' }}>Rp</span>}
              value={amount}
              onChange={(e) => {
                const numeric = e.target.value.replace(/\D/g, '');
                setAmount(numeric ? parseInt(numeric, 10).toLocaleString('id-ID') : '');
              }}
            />
          </div>

          {/* Quick Amounts Grid */}
          <div style={{ marginBottom: '18px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
              }}
            >
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q.toLocaleString('id-ID'))}
                  style={{
                    padding: '8px 4px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#4F46E5',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {formatRupiah(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan */}
          <CustomTextField
            label="Catatan / Berita Transfer (Opsional)"
            placeholder="Contoh: Bayar makan siang"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div style={{ marginTop: '24px' }}>
            <CustomButton
              text="Lanjutkan Transfer"
              type="submit"
            />
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleProceedToPin}
        title="Konfirmasi Transfer"
        message={`Kirim ${formatRupiah(numAmount)} kepada ${recipient?.name || targetIpayId}?`}
        confirmText="Lanjut ke PIN"
      />

      {/* PIN Dialog */}
      <PinInputDialog
        isOpen={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onSuccess={handlePinSubmit}
        isLoading={isTransferring}
        title="Otorisasi PIN Transfer"
        description={`Masukkan 6-digit PIN iPay untuk mentransfer ${formatRupiah(numAmount)} kepada ${recipient?.name || targetIpayId}`}
      />

      {/* Success Receipt Modal */}
      {successData && (
        <SuccessReceiptModal
          isOpen={Boolean(successData)}
          onClose={() => {
            setSuccessData(null);
            navigate('/home');
          }}
          title="Transfer Berhasil!"
          message={`Transfer kepada ${successData.recipientName} berhasil diproses.`}
          transactionCode={successData.res?.transaction_code}
          recipientName={successData.recipientName}
          source="Saldo iPay"
          amount={successData.amount}
          newBalance={successData.res?.new_balance ? parseFloat(successData.res.new_balance) : null}
          buttonText="Selesai"
        />
      )}
    </AppLayout>
  );
};

export default Transfer;
