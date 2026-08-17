import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const PayDirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [paymentCode, setPaymentCode] = useState(searchParams.get('code') || '');
  const [payerIpayId, setPayerIpayId] = useState(searchParams.get('payer') || '');
  const [payerName, setPayerName] = useState<string | null>(null);
  const [source, setSource] = useState<'ipay' | 'dana' | 'gopay' | 'bca'>('ipay');
  const [simulatedStatus, setSimulatedStatus] = useState<'success' | 'failed'>('success');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{
    message: string;
    transaction_code: string;
    amount: number;
    paid_to: string;
    new_balance: number;
  } | null>(null);

  const navigate = useNavigate();

  // Cek ID pembeli
  const handleCheckPayer = async () => {
    if (!payerIpayId) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.get(`/transactions/check-user/${payerIpayId.toUpperCase()}`);
      if (res.data?.data) {
        setPayerName(res.data.data.name);
        setPayerIpayId(res.data.data.ipay_id);
      }
    } catch (err: any) {
      setPayerName(null);
      setError(err.response?.data?.message || 'iPay ID pembeli tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (payerIpayId) {
      handleCheckPayer();
    }
  }, []);

  const handlePayDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (paymentCode.length !== 6 || !/^\d+$/.test(paymentCode)) {
      setError('Kode pembayaran harus berupa 6 digit angka.');
      return;
    }

    if (!payerIpayId) {
      setError('Masukkan iPay ID pembeli.');
      return;
    }

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError('PIN pembeli harus berupa 6 digit angka.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/payments/pay-direct', {
        payment_code: paymentCode,
        payer_ipay_id: payerIpayId.toUpperCase(),
        pin,
        source,
        simulated_status: source !== 'ipay' ? simulatedStatus : undefined,
      });

      setSuccessData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pembayaran gagal. Pastikan Kode Pembayaran, iPay ID, dan PIN pembeli sesuai.');
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
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🧾</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '8px' }}>
            Pay Direct Berhasil!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
            Pembayaran langsung di perangkat penjual telah sukses diproses.
          </p>

          <div style={{ background: 'var(--bg-muted)', padding: '20px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kode Transaksi:</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{successData.transaction_code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Penjual (Penerima):</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{successData.paid_to}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sumber Dana:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                {source}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Pembayaran:</span>
              <span style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '1.1rem' }}>
                {formatIDR(successData.amount)}
              </span>
            </div>
          </div>

          <button onClick={() => navigate('/home')} className="btn-primary">
            Selesai & Kembali ke Beranda
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
            onClick={() => navigate('/home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
          >
            ←
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Pay Direct (Di HP Penjual)</h2>
        </div>
      </header>

      <main className="app-content">
        <div style={{ background: 'var(--primary-light)', padding: '14px 16px', borderRadius: 'var(--border-radius-md)', marginBottom: '20px', border: '1px solid #c7d2fe' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, display: 'block', lineHeight: 1.4 }}>
            💡 Pembeli tidak membawa smartphone? Pembeli dapat membayar langsung di perangkat penjual menggunakan iPay ID dan PIN miliknya.
          </span>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handlePayDirect}>
          {/* Input Kode Pembayaran */}
          <div className="form-group">
            <label className="form-label">Kode Pembayaran 6 Digit (Dari Tagihan Penjual)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="form-input"
              placeholder="Contoh: 262804"
              value={paymentCode}
              onChange={(e) => setPaymentCode(e.target.value.replace(/\D/g, ''))}
              required
              style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '4px', textAlign: 'center' }}
            />
          </div>

          {/* Input iPay ID Pembeli */}
          <div className="form-group">
            <label className="form-label">iPay ID Pembeli</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: IPY0000001"
                value={payerIpayId}
                onChange={(e) => {
                  setPayerIpayId(e.target.value.toUpperCase());
                  setPayerName(null);
                }}
                required
              />
              <button
                type="button"
                onClick={handleCheckPayer}
                disabled={loading || !payerIpayId}
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
                {loading ? 'Cek...' : 'Cek ID'}
              </button>
            </div>
            {payerName && (
              <div style={{ marginTop: '6px', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>
                ✓ Akun Pembeli: {payerName}
              </div>
            )}
          </div>

          {/* Sumber Dana Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Pilih Sumber Dana Pembayaran</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Saldo iPay */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px',
                  background: source === 'ipay' ? 'var(--primary-light)' : 'var(--bg-card)',
                  border: source === 'ipay' ? '2.5px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', color: 'var(--text-main)' }}>
                    Saldo iPay Pembeli
                  </span>
                </div>
                <input
                  type="radio"
                  name="payment_source"
                  checked={source === 'ipay'}
                  onChange={() => setSource('ipay')}
                />
              </label>

              {/* DANA */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px',
                  background: source === 'dana' ? '#f0f9ff' : 'var(--bg-card)',
                  border: source === 'dana' ? '2.5px solid #0284c7' : '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', color: '#0369a1' }}>
                    🔴 DANA (Simulasi)
                  </span>
                </div>
                <input
                  type="radio"
                  name="payment_source"
                  checked={source === 'dana'}
                  onChange={() => setSource('dana')}
                />
              </label>

              {/* GoPay */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px',
                  background: source === 'gopay' ? '#ecfdf5' : 'var(--bg-card)',
                  border: source === 'gopay' ? '2.5px solid #10b981' : '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', color: '#047857' }}>
                    🟢 GoPay (Simulasi)
                  </span>
                </div>
                <input
                  type="radio"
                  name="payment_source"
                  checked={source === 'gopay'}
                  onChange={() => setSource('gopay')}
                />
              </label>

              {/* BCA */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px',
                  background: source === 'bca' ? '#f5f3ff' : 'var(--bg-card)',
                  border: source === 'bca' ? '2.5px solid #8b5cf6' : '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', color: '#6d28d9' }}>
                    🔵 Bank BCA (Simulasi)
                  </span>
                </div>
                <input
                  type="radio"
                  name="payment_source"
                  checked={source === 'bca'}
                  onChange={() => setSource('bca')}
                />
              </label>
            </div>
          </div>

          {/* Simulasi Status (Hanya untuk DANA, GoPay, BCA) */}
          {source !== 'ipay' && (
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <label className="form-label" style={{ marginBottom: '10px' }}>Simulasikan Status Transaksi:</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer', fontWeight: 600, color: 'var(--secondary)' }}>
                  <input
                    type="radio"
                    name="simulated_status"
                    checked={simulatedStatus === 'success'}
                    onChange={() => setSimulatedStatus('success')}
                  />
                  Simulasi Sukses
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer', fontWeight: 600, color: 'var(--danger)' }}>
                  <input
                    type="radio"
                    name="simulated_status"
                    checked={simulatedStatus === 'failed'}
                    onChange={() => setSimulatedStatus('failed')}
                  />
                  Simulasi Gagal
                </label>
              </div>
            </div>
          )}

          {/* Input PIN Pembeli */}
          <div className="form-group">
            <label className="form-label">
              PIN Keamanan Pembeli (6 Digit)
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                *Berikan layar ke pembeli untuk memasukkan PIN secara privat
              </span>
            </label>
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
            disabled={loading || paymentCode.length !== 6 || !payerIpayId || pin.length !== 6}
          >
            {loading ? 'Memproses Pembayaran...' : 'Otorisasi & Bayar Langsung'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default PayDirect;
