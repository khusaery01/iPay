import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { PaymentRequest } from '../types';

const RequestPayment: React.FC = () => {
  const [toIpayId, setToIpayId] = useState('');
  const [payerName, setPayerName] = useState<string | null>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdData, setCreatedData] = useState<{
    message: string;
    payment_code: string;
    data: PaymentRequest;
  } | null>(null);

  const navigate = useNavigate();

  // Validasi ID Payer
  const handleCheckUser = async () => {
    if (!toIpayId) return;
    setError('');
    setCheckingUser(true);
    try {
      const res = await api.get(`/transactions/check-user/${toIpayId.toUpperCase()}`);
      if (res.data?.data) {
        setPayerName(res.data.data.name);
        setToIpayId(res.data.data.ipay_id);
      }
    } catch (err: any) {
      setPayerName(null);
      setError(err.response?.data?.message || 'iPay ID tujuan tidak ditemukan.');
    } finally {
      setCheckingUser(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 1000) {
      setError('Nominal tagihan minimal Rp 1.000.');
      return;
    }

    if (!toIpayId) {
      setError('Masukkan iPay ID tujuan.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/payments/request', {
        to_ipay_id: toIpayId,
        amount: numericAmount,
        description: description || undefined,
        notes: notes || undefined,
      });

      setCreatedData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat tagihan. Periksa kembali data Anda.');
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

  if (createdData) {
    return (
      <div className="app-container">
        <div className="app-content" style={{ textAlign: 'center', paddingTop: '30px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>📋</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px' }}>
            Permintaan Tagihan Dibuat!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Tunjukkan kode ini ke pembeli atau tunggu persetujuan di perangkat mereka.
          </p>

          {/* Payment Code Badge */}
          <div style={{ background: 'var(--primary-light)', border: '2px dashed var(--primary)', padding: '16px', borderRadius: 'var(--border-radius-md)', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
              Kode Pembayaran Sekali Pakai
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '4px' }}>
              {createdData.payment_code}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Status: <strong style={{ color: 'var(--accent-amber)' }}>PENDING</strong>
            </span>
          </div>

          <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Ditagihkan ke:</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                {createdData.data.payer?.name || toIpayId}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Nominal Tagihan:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                {formatIDR(Number(createdData.data.amount))}
              </span>
            </div>
            {createdData.data.description && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Keterangan:</span>
                <span style={{ fontSize: '0.82rem' }}>{createdData.data.description}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => navigate(`/pay-direct?code=${createdData.payment_code}&payer=${toIpayId}`)}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              📱 Bayar Langsung di HP Ini (Pay Direct)
            </button>
            <button onClick={() => navigate('/home')} className="btn-primary" style={{ background: 'var(--bg-muted)', color: 'var(--text-main)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
              Kembali ke Beranda
            </button>
          </div>
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
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Minta Saldo / Tagihan</h2>
        </div>
      </header>

      <main className="app-content">
        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleCreateRequest}>
          {/* Input iPay ID Payer */}
          <div className="form-group">
            <label className="form-label">iPay ID Pembayar / Tujuan</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: IPY0000002"
                value={toIpayId}
                onChange={(e) => {
                  setToIpayId(e.target.value.toUpperCase());
                  setPayerName(null);
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
            {payerName && (
              <div style={{ marginTop: '6px', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>
                ✓ Pembayar: {payerName}
              </div>
            )}
          </div>

          {/* Input Nominal */}
          <div className="form-group">
            <label className="form-label">Nominal Permintaan (Rp)</label>
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

          {/* Deskripsi */}
          <div className="form-group">
            <label className="form-label">Deskripsi / Nama Barang (Opsional)</label>
            <input
              type="text"
              maxLength={255}
              className="form-input"
              placeholder="Contoh: Pembayaran kaos atau tagihan kopi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Catatan Tambahan */}
          <div className="form-group">
            <label className="form-label">Catatan Tambahan (Opsional)</label>
            <textarea
              maxLength={500}
              className="form-input"
              rows={3}
              placeholder="Detail tambahan untuk pembeli..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading || !toIpayId || !amount}>
            {loading ? 'Membuat Permintaan...' : 'Buat Permintaan Pembayaran'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default RequestPayment;
