import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { PaymentMethod } from '../types';

const PRESET_AMOUNTS = [20000, 50000, 100000, 200000, 500000, 1000000];

const TopUp: React.FC = () => {
  const [amount, setAmount] = useState<number | ''>('');
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingMethods, setFetchingMethods] = useState(true);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{
    message: string;
    transaction_code: string;
    amount: number;
    new_balance: number;
  } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await api.get('/wallet/methods');
        if (res.data && Array.isArray(res.data.data)) {
          setMethods(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedMethodId(res.data.data[0].id);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat metode pembayaran:', err);
      } finally {
        setFetchingMethods(false);
      }
    };

    fetchMethods();
  }, []);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 10000) {
      setError('Nominal Top Up minimal Rp 10.000.');
      return;
    }

    if (numericAmount > 10000000) {
      setError('Nominal Top Up maksimal Rp 10.000.000.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/wallet/topup', {
        amount: numericAmount,
        payment_method_id: selectedMethodId || undefined,
      });

      setSuccessData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Top Up gagal diproses. Silakan coba lagi.');
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
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '8px' }}>
            Top Up Berhasil!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Saldo iPay Anda telah diperbarui.
          </p>

          <div style={{ background: 'var(--bg-muted)', padding: '20px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kode Transaksi:</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{successData.transaction_code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nominal Top Up:</span>
              <span style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '0.95rem' }}>
                +{formatIDR(successData.amount)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Saldo Baru:</span>
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
            onClick={() => navigate('/home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
          >
            ←
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Top Up Saldo</h2>
        </div>
      </header>

      <main className="app-content">
        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleTopUp}>
          {/* Pilih Nominal Cepat */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Pilih Nominal Cepat</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {PRESET_AMOUNTS.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val)}
                  style={{
                    padding: '12px 6px',
                    borderRadius: 'var(--border-radius-md)',
                    border: amount === val ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: amount === val ? 'var(--primary-light)' : 'var(--bg-card)',
                    color: amount === val ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {formatIDR(val).replace(',00', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Input Nominal Manual */}
          <div className="form-group">
            <label className="form-label">Atau Masukkan Nominal Sendiri (Rp)</label>
            <input
              type="number"
              min="10000"
              max="10000000"
              step="1000"
              className="form-input"
              placeholder="Minimal Rp 10.000"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>

          {/* Pilih Sumber / Metode Pembayaran */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">Metode Pembayaran Top Up</label>
            {fetchingMethods ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Memuat metode...</div>
            ) : methods.length === 0 ? (
              <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: 'var(--border-radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                Direct Virtual Account (Instan)
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--border-radius-md)',
                    border: selectedMethodId === null ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: selectedMethodId === null ? 'var(--primary-light)' : 'var(--bg-card)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Instan Virtual Account</span>
                  <input
                    type="radio"
                    name="payment_method"
                    checked={selectedMethodId === null}
                    onChange={() => setSelectedMethodId(null)}
                  />
                </label>
                {methods.map((m) => (
                  <label
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--border-radius-md)',
                      border: selectedMethodId === m.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: selectedMethodId === m.id ? 'var(--primary-light)' : 'var(--bg-card)',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block' }}>{m.provider}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.identifier || m.type}</span>
                    </div>
                    <input
                      type="radio"
                      name="payment_method"
                      checked={selectedMethodId === m.id}
                      onChange={() => setSelectedMethodId(m.id)}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading || !amount}>
            {loading ? 'Memproses Top Up...' : `Konfirmasi Top Up ${amount ? formatIDR(Number(amount)) : ''}`}
          </button>
        </form>
      </main>
    </div>
  );
};

export default TopUp;
