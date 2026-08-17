import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { PaymentRequest } from '../types';

const PayBill: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bill, setBill] = useState<PaymentRequest | null>(null);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [source, setSource] = useState<'ipay' | 'dana' | 'gopay' | 'bca'>('ipay');
  const [simulatedStatus, setSimulatedStatus] = useState<'success' | 'failed'>('success');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{
    message: string;
    transaction_code: string;
    amount: number;
    paid_to: string;
    new_balance: number;
  } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBillAndWallet = async () => {
      try {
        setLoading(true);
        // 1. Ambil detail tagihan
        const billRes = await api.get(`/payments/${id}`);
        setBill(billRes.data.data);

        // 2. Ambil saldo user saat ini
        const walletRes = await api.get('/wallet');
        setUserBalance(walletRes.data.balance);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat detail tagihan.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBillAndWallet();
    }
  }, [id]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError('PIN harus berupa 6 digit angka.');
      return;
    }

    if (source === 'ipay' && userBalance !== null && bill && userBalance < bill.amount) {
      setError('Saldo iPay Anda tidak mencukupi untuk membayar tagihan ini.');
      return;
    }

    setProcessing(true);

    try {
      const response = await api.post(`/payments/${id}/pay`, {
        pin,
        source,
        simulated_status: source !== 'ipay' ? simulatedStatus : undefined,
      });

      setSuccessData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pembayaran gagal. Pastikan PIN benar dan saldo mencukupi.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menolak tagihan pembayaran ini?')) {
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/payments/${id}/reject`);
      alert('Tagihan pembayaran berhasil ditolak.');
      navigate('/bills');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menolak tagihan.');
    } finally {
      setProcessing(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="app-content" style={{ textAlign: 'center', paddingTop: '50px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat rincian tagihan...</p>
        </div>
      </div>
    );
  }

  if (successData) {
    return (
      <div className="app-container">
        <div className="app-content" style={{ textAlign: 'center', paddingTop: '40px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '8px' }}>
            Pembayaran Berhasil!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
            Tagihan telah berhasil dibayar menggunakan {source === 'ipay' ? 'Saldo iPay' : `Simulasi ${source.toUpperCase()}`}.
          </p>

          <div style={{ background: 'var(--bg-muted)', padding: '20px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kode Transaksi:</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{successData.transaction_code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Dibayarkan Kepada:</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{successData.paid_to}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sumber Pembayaran:</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase' }}>
                {source}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Jumlah Pembayaran:</span>
              <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.95rem' }}>
                -{formatIDR(successData.amount)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sisa Saldo iPay:</span>
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

  if (!bill) {
    return (
      <div className="app-container">
        <div className="app-content" style={{ textAlign: 'center', paddingTop: '40px' }}>
          <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>Tagihan tidak ditemukan atau telah kedaluwarsa.</p>
          <button onClick={() => navigate('/bills')} className="btn-primary">Kembali ke Tagihan</button>
        </div>
      </div>
    );
  }

  const isInsufficient = userBalance !== null && userBalance < bill.amount;

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/bills')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
          >
            ←
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Bayar Tagihan</h2>
        </div>
      </header>

      <main className="app-content">
        {error && <div className="alert-error">{error}</div>}

        {/* Ringkasan Tagihan */}
        <div style={{ background: 'var(--bg-muted)', padding: '20px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Rincian Permintaan
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '12px' }}>
            {formatIDR(Number(bill.amount))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Pemohon / Penjual:</span>
              <span style={{ fontWeight: 700 }}>{bill.requester?.name} ({bill.requester?.ipay_id})</span>
            </div>
            {bill.description && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Deskripsi:</span>
                <span>{bill.description}</span>
              </div>
            )}
            {bill.notes && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Catatan:</span>
                <span>{bill.notes}</span>
              </div>
            )}
          </div>
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
                  Saldo iPay
                </span>
                <span style={{ fontSize: '0.78rem', color: isInsufficient ? 'var(--danger)' : 'var(--text-muted)' }}>
                  Tersedia: <strong>{userBalance !== null ? formatIDR(userBalance) : '...'}</strong>
                  {isInsufficient && ' (Saldo tidak cukup)'}
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Pembayaran dengan e-wallet DANA
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Pembayaran dengan e-wallet GoPay
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Simulasi Transfer VA Bank BCA
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

        {/* Form Bayar dengan PIN */}
        <form onSubmit={handlePay}>
          <div className="form-group">
            <label className="form-label">Masukkan PIN Keamanan (6 Digit)</label>
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
            disabled={processing || pin.length !== 6 || (source === 'ipay' && isInsufficient)}
            style={{ marginBottom: '12px' }}
          >
            {processing ? 'Memproses Pembayaran...' : `Konfirmasi Bayar ${formatIDR(Number(bill.amount))}`}
          </button>

          <button
            type="button"
            onClick={handleReject}
            disabled={processing}
            style={{
              width: '100%',
              padding: '12px',
              background: 'none',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              borderRadius: 'var(--border-radius-md)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Tolak Permintaan Ini
          </button>
        </form>
      </main>
    </div>
  );
};

export default PayBill;
