import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import { RequestIcon } from '../components/Icons';
import type { PaymentRequest } from '../types';

const Bills: React.FC = () => {
  const [bills, setBills] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('pending');
  const navigate = useNavigate();

  const fetchBills = async () => {
    try {
      setLoading(true);
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const res = await api.get(`/payments/incoming${query}`);
      if (res.data && Array.isArray(res.data.data)) {
        setBills(res.data.data);
      }
    } catch (err) {
      console.warn('Gagal memuat daftar tagihan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [filter]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <AppLayout
      userName={localStorage.getItem('ipay_user_name') || 'Pengguna'}
      activeTab="bills"
      onTabChange={(tab) => {
        if (tab === 'home') navigate('/home');
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Tagihan Masuk
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Daftar permintaan pembayaran yang ditagihkan kepada Anda
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        <button
          onClick={() => setFilter('pending')}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--border-radius-full)',
            border: filter === 'pending' ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
            background: filter === 'pending' ? 'var(--primary-light)' : 'var(--bg-card)',
            color: filter === 'pending' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Menunggu Bayar
        </button>
        <button
          onClick={() => setFilter('accepted')}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--border-radius-full)',
            border: filter === 'accepted' ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
            background: filter === 'accepted' ? 'var(--primary-light)' : 'var(--bg-card)',
            color: filter === 'accepted' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Selesai
        </button>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--border-radius-full)',
            border: filter === 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
            background: filter === 'all' ? 'var(--primary-light)' : 'var(--bg-card)',
            color: filter === 'all' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Semua
        </button>
      </div>

      {/* Bill List */}
      {loading ? (
        <div className="empty-state">
          <p className="empty-state-text">Memuat tagihan...</p>
        </div>
      ) : bills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <RequestIcon size={36} color="#94a3b8" />
          </div>
          <p className="empty-state-text">
            {filter === 'pending' ? 'Tidak ada tagihan yang menunggu pembayaran' : 'Belum ada tagihan'}
          </p>
        </div>
      ) : (
        <div className="bills-grid">
          {bills.map((bill) => {
            const isPending = bill.status === 'pending';
            return (
              <div
                key={bill.id}
                onClick={() => {
                  if (isPending) {
                    navigate(`/pay/${bill.id}`);
                  }
                }}
                style={{
                  background: 'var(--bg-card)',
                  border: isPending ? '1.5px solid #c7d2fe' : '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '16px',
                  cursor: isPending ? 'pointer' : 'default',
                  boxShadow: isPending ? '0 4px 12px rgba(79, 70, 229, 0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                      {bill.requester?.name || 'Pengirim Tagihan'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {bill.requester?.ipay_id} • {formatDate(bill.created_at)}
                    </span>
                  </div>
                  <span
                    className={`txn-status status-${bill.status}`}
                    style={{
                      background: isPending ? 'var(--primary-light)' : 'var(--secondary-light)',
                      padding: '4px 8px',
                      borderRadius: 'var(--border-radius-full)',
                      fontSize: '0.7rem',
                    }}
                  >
                    {bill.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {bill.description || 'Permintaan pembayaran'}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatIDR(Number(bill.amount))}
                  </span>
                </div>

                {isPending && (
                  <div style={{ marginTop: '10px', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                      Bayar Sekarang →
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default Bills;
