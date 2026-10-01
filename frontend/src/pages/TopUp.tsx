import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import { AppBar } from '../components/AppBar';
import { CustomButton } from '../components/CustomButton';
import { CustomTextField } from '../components/CustomTextField';
import { SuccessReceiptModal } from '../components/SuccessReceiptModal';
import {
  TopUpIcon,
  BuildingIcon,
  CreditCardIcon,
  WalletIcon,
} from '../components/Icons';

export const TopUp: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('gopay');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    amount: number;
    method: string;
    newBalance?: number;
    transactionCode?: string;
  } | null>(null);

  const navigate = useNavigate();

  const quickAmounts = [10000, 20000, 50000, 100000, 250000, 500000];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numAmount = parseFloat(amount.replace(/\D/g, ''));
    if (isNaN(numAmount) || numAmount < 10000) {
      setErrorMessage('Minimal Top Up adalah Rp10.000.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/topups', {
        amount: numAmount,
        payment_method_id: selectedMethod === 'bca' ? 2 : 1, // sample mapping
        provider: selectedMethod.toUpperCase(),
      });

      setSuccessData({
        amount: numAmount,
        method: selectedMethod.toUpperCase(),
        newBalance: res.data?.new_balance ? parseFloat(res.data.new_balance) : undefined,
        transactionCode: res.data?.transaction_code || res.data?.transaction?.transaction_code,
      });
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Top Up saldo gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout activeTab="home">
      <AppBar
        title="Top Up Saldo"
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

        <form onSubmit={handleTopUp}>
          {/* Nominal Input */}
          <CustomTextField
            label="Nominal Top Up (Rp)"
            placeholder="Minimal Rp10.000"
            prefixIcon={<TopUpIcon size={20} color="#10B981" />}
            value={amount}
            onChange={(e) => {
              const numeric = e.target.value.replace(/\D/g, '');
              setAmount(numeric ? parseInt(numeric, 10).toLocaleString('id-ID') : '');
            }}
          />

          {/* Quick Amounts Grid */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '8px' }}>
              Pilihan Nominal Cepat:
            </label>
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
                    padding: '10px 4px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12.5px',
                    fontWeight: 700,
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

          {/* Payment Method Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: '10px' }}>
              Pilih Sumber Pembayaran Top Up:
            </label>

            {[
              { id: 'gopay', name: 'GoPay', sub: 'Instan via E-Wallet GoPay', icon: <CreditCardIcon size={20} color="#00AED6" />, color: '#00AED6' },
              { id: 'dana', name: 'DANA', sub: 'Instan via E-Wallet DANA', icon: <WalletIcon size={20} color="#108EE9" />, color: '#108EE9' },
              { id: 'bca', name: 'BCA Virtual Account', sub: 'Transfer via ATM / m-BCA', icon: <BuildingIcon size={20} color="#005DAA" />, color: '#005DAA' },
            ].map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: `1.5px solid ${isSelected ? method.color : '#E2E8F0'}`,
                    backgroundColor: isSelected ? `${method.color}0D` : '#FFFFFF',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ marginRight: '12px' }}>{method.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#0F172A' }}>
                      {method.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                      {method.sub}
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => setSelectedMethod(method.id)}
                    style={{ accentColor: method.color, cursor: 'pointer' }}
                  />
                </div>
              );
            })}
          </div>

          <CustomButton
            text="Lanjutkan Top Up"
            type="submit"
            isLoading={loading}
          />
        </form>
      </div>

      {/* Success Modal */}
      {successData && (
        <SuccessReceiptModal
          isOpen={Boolean(successData)}
          onClose={() => {
            setSuccessData(null);
            navigate('/home');
          }}
          title="Top Up Berhasil!"
          message={`Saldo iPay Anda berhasil ditambahkan sebesar ${formatRupiah(successData.amount)}.`}
          transactionCode={successData.transactionCode}
          source={successData.method}
          amount={successData.amount}
          newBalance={successData.newBalance}
          buttonText="Selesai"
        />
      )}
    </AppLayout>
  );
};

export default TopUp;
