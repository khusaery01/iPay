import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Transfer: React.FC = () => {
  const [toIpayId, setToIpayId] = useState('');
  const [receiverName, setReceiverName] = useState<string | null>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{
    message: string;
    transaction_code: string;
    to: { name: string; ipay_id: string };
    amount: number;
    new_balance: number;
  } | null>(null);

  const navigate = useNavigate();

  // Validasi ID Penerima
  const handleCheckUser = async () => {
    if (!toIpayId) return;
    setError('');
    setCheckingUser(true);
    try {
      const res = await api.get(`/transactions/check-user/${toIpayId.toUpperCase()}`);
      if (res.data?.data) {
        setReceiverName(res.data.data.name);
        setToIpayId(res.data.data.ipay_id);
      }
    } catch (err: any) {
      setReceiverName(null);
      setError(err.response?.data?.message || 'iPay ID penerima tidak ditemukan.');
    } finally {
      setCheckingUser(false);
    }
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 1000) {
      setError('Nominal transfer minimal Rp 1.000.');
      return;
    }

    if (!toIpayId) {
      setError('Masukkan iPay ID penerima.');
      return;
    }

    setStep('confirm');
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError('PIN harus berupa 6 digit angka.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/transactions/transfer', {
        to_ipay_id: toIpayId,
        amount: Number(amount),
        description: description || undefined,
        pin,
      });

      setSuccessData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transfer gagal. Pastikan saldo cukup dan PIN benar.');
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

  if (successData) {
    return (
      <div className="app-container">
        <div className="app-content" style={{ textAlign: 'center', paddingTop: '40px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>💸</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
            Transfer Berhasil!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Dana telah terkirim ke penerima.
          </p>

          <div style={{ background: 'var(--bg-muted)', padding: '20px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kode Transaksi:</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{successData.transaction_code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Penerima:</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {successData.to.name} ({successData.to.ipay_id})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nominal:</span>
              <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.95rem' }}>
                -{formatIDR(successData.amount)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sisa Saldo:</span>
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>
                {formatIDR(successData.new_balance)}
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
              if (step === 'confirm') setStep('input');
              else navigate('/home');
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
          >
            ←
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {step === 'input' ? 'Kirim Saldo' : 'Konfirmasi Transfer'}
          </h2>
        </div>
      </header>

      <main className="app-content">
        {error && <div className="alert-error">{error}</div>}

        {step === 'input' ? (
          <form onSubmit={handleProceedToConfirm}>
            {/* Input iPay ID Tujuan */}
            <div className="form-group">
              <label className="form-label">iPay ID Penerima</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: IPY0000002"
                  value={toIpayId}
                  onChange={(e) => {
                    setToIpayId(e.target.value.toUpperCase());
                    setReceiverName(null);
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={handleCheckUser}
                  disabled={checkingUser || !toIpayId}
                  style={{
                    padding: '0 16px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary)',
                    borderRadius: 'var(--border-radius-md)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {checkingUser ? 'Cek...' : 'Cek ID'}
                </button>
              </div>
              {receiverName && (
                <div style={{ marginTop: '6px', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>
                  ✓ Penerima: {receiverName}
                </div>
              )}
            </div>

            {/* Input Nominal */}
            <div className="form-group">
              <label className="form-label">Nominal Transfer (Rp)</label>
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
              />
            </div>

            {/* Catatan Opsional */}
            <div className="form-group">
              <label className="form-label">Catatan / Keterangan (Opsional)</label>
              <input
                type="text"
                maxLength={255}
                className="form-input"
                placeholder="Contoh: Patungan makan siang"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={!toIpayId || !amount}>
              Lanjut Konfirmasi
            </button>
          </form>
        ) : (
          <form onSubmit={handleExecuteTransfer}>
            {/* Ringkasan Konfirmasi */}
            <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Penerima:</span>
                <span style={{ fontWeight: 700 }}>{receiverName || toIpayId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>iPay ID:</span>
                <span style={{ fontWeight: 600 }}>{toIpayId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nominal:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatIDR(Number(amount))}</span>
              </div>
              {description && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Catatan:</span>
                  <span style={{ fontSize: '0.85rem' }}>{description}</span>
                </div>
              )}
            </div>

            {/* Input PIN Otorisasi */}
            <div className="form-group">
              <label className="form-label">Masukkan PIN Keamanan Anda (6 Digit)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="form-input"
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading || pin.length !== 6}>
              {loading ? 'Mengirim Dana...' : `Kirim ${formatIDR(Number(amount))}`}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default Transfer;
