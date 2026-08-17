import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import { TransactionList } from '../components/TransactionList';
import type { Transaction } from '../types';

const HistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const query = filterType === 'all' ? '' : `?type=${filterType}`;
      const res = await api.get(`/transactions${query}`);
      if (res.data && Array.isArray(res.data.data)) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.warn('Gagal memuat riwayat transaksi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterType]);

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <AppLayout
      userName={localStorage.getItem('ipay_user_name') || 'Pengguna'}
      activeTab="history"
      onTabChange={(tab) => {
        if (tab === 'home') navigate('/home');
        else if (tab === 'bills') navigate('/bills');
        else if (tab === 'profile') navigate('/profile');
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Riwayat Transaksi
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Daftar seluruh aktivitas transaksi masuk dan keluar dompet iPay Anda
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', name: 'Semua Transaksi' },
          { id: 'transfer', name: 'Transfer' },
          { id: 'topup', name: 'Top Up' },
          { id: 'payment', name: 'Pembayaran' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--border-radius-full)',
              border: filterType === tab.id ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
              background: filterType === tab.id ? 'var(--primary-light)' : 'var(--bg-card)',
              color: filterType === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* List Transaksi */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '20px' }}>
        <TransactionList transactions={transactions} loading={loading} />
      </div>

      {/* Detail Transaction Modal */}
      {selectedTxn && (
        <div className="modal-overlay" onClick={() => setSelectedTxn(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px' }}>Rincian Transaksi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Kode Transaksi:</span>
                <span style={{ fontWeight: 700 }}>{selectedTxn.transaction_code}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Jenis:</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedTxn.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Nominal:</span>
                <span style={{ fontWeight: 800, color: selectedTxn.direction === 'in' ? 'var(--secondary)' : 'var(--danger)' }}>
                  {selectedTxn.direction === 'in' ? '+' : '-'}{formatIDR(selectedTxn.amount)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Waktu:</span>
                <span>{formatDate(selectedTxn.created_at)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ fontWeight: 700 }} className={`status-${selectedTxn.status}`}>{selectedTxn.status}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedTxn(null)}
              className="btn-primary"
              style={{ marginTop: '20px' }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default HistoryPage;
