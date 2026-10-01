import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import { AppBar } from '../components/AppBar';
import { TransactionItem } from '../components/TransactionItem';
import { StatusBadge } from '../components/StatusBadge';
import { FilterIcon, AlertCircleIcon, CloseIcon } from '../components/Icons';
import type { Transaction } from '../types';

export const History: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTxnForDetail, setSelectedTxnForDetail] = useState<Transaction | null>(null);
  const navigate = useNavigate();

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const params: any = {};
      if (selectedType !== 'all') {
        params.type = selectedType;
      }
      const res = await api.get('/transactions', { params });
      const data = res.data && Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setTransactions(data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Gagal memuat riwayat transaksi.');
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const filterChips = [
    { label: 'Semua Jenis', val: 'all' },
    { label: 'Transfer', val: 'transfer' },
    { label: 'Top Up', val: 'topup' },
    { label: 'Pembayaran', val: 'payment' },
  ];

  return (
    <AppLayout activeTab="history">
      <AppBar
        title="Riwayat Transaksi"
        showBack
        onBack={() => navigate('/home')}
      />

      {/* Filter Bar */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', color: '#64748B', marginRight: '4px' }}>
          <FilterIcon size={18} />
        </div>

        {filterChips.map((chip) => {
          const isSelected = selectedType === chip.val;
          return (
            <button
              key={chip.val}
              type="button"
              onClick={() => setSelectedType(chip.val)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: isSelected ? '#4F46E5' : '#F1F5F9',
                color: isSelected ? '#FFFFFF' : '#334155',
                fontSize: '12px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Transactions List */}
      <div style={{ padding: '8px 0' }}>
        {loading && transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B' }}>
            <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '13.5px' }}>Memuat riwayat transaksi...</p>
          </div>
        ) : errorMessage && transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
            <div style={{ color: '#EF4444', marginBottom: '12px' }}>
              <AlertCircleIcon size={44} />
            </div>
            <p style={{ fontSize: '14px', marginBottom: '16px' }}>{errorMessage}</p>
            <button
              type="button"
              onClick={fetchHistory}
              style={{
                padding: '8px 20px',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Coba Lagi
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
            <p style={{ fontSize: '14px' }}>Belum ada transaksi ditemukan.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
            {transactions.map((txn, idx) => (
              <TransactionItem
                key={txn.id || idx}
                transaction={txn}
                onTap={() => setSelectedTxnForDetail(txn)}
                showDivider={idx < transactions.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Transaksi Modal */}
      {selectedTxnForDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setSelectedTxnForDetail(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 -8px 30px rgba(15, 23, 42, 0.15)',
              animation: 'slideUpModal 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>
                Detail Transaksi
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTxnForDetail(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  padding: '4px',
                }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {/* Amount and Status Header */}
            <div
              style={{
                textAlign: 'center',
                padding: '18px',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  color: selectedTxnForDetail.direction === 'in' || selectedTxnForDetail.type === 'topup' ? '#10B981' : '#0F172A',
                  marginBottom: '6px',
                }}
              >
                {selectedTxnForDetail.direction === 'in' || selectedTxnForDetail.type === 'topup' ? '+' : '-'} {formatRupiah(selectedTxnForDetail.amount)}
              </div>
              <StatusBadge status={selectedTxnForDetail.status} />
            </div>

            {/* Rincian Transaksi */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '13px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Kode Transaksi</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedTxnForDetail.transaction_code || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Tipe Transaksi</span>
                <span style={{ fontWeight: 600, color: '#0F172A', textTransform: 'capitalize' }}>{selectedTxnForDetail.type}</span>
              </div>
              {selectedTxnForDetail.sender && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Pengirim</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedTxnForDetail.sender.name} ({selectedTxnForDetail.sender.ipay_id})</span>
                </div>
              )}
              {selectedTxnForDetail.receiver && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Penerima</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedTxnForDetail.receiver.name} ({selectedTxnForDetail.receiver.ipay_id})</span>
                </div>
              )}
              {selectedTxnForDetail.description && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Deskripsi</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedTxnForDetail.description}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Tanggal & Waktu</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{formatDate(selectedTxnForDetail.created_at)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTxnForDetail(null)}
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '14.5px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default History;
