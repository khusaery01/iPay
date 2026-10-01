import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import { BalanceCard } from '../components/BalanceCard';
import { QuickAction } from '../components/QuickAction';
import { TransactionList } from '../components/TransactionList';
import {
  SearchIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  CopyIcon,
  WalletIcon,
} from '../components/Icons';
import type { Transaction } from '../types';

interface WalletData {
  ipay_id: string;
  name: string;
  email?: string;
  phone?: string;
  balance: number;
}

const Home: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingBillsCount, setPendingBillsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [quickBillCode, setQuickBillCode] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // 1. Fetch wallet info
      const walletRes = await api.get<WalletData>('/wallet');
      setWallet(walletRes.data);
      if (walletRes.data.ipay_id) {
        localStorage.setItem('ipay_user_id', walletRes.data.ipay_id);
      }
      if (walletRes.data.name) {
        localStorage.setItem('ipay_user_name', walletRes.data.name);
      }

      // 2. Fetch recent transactions
      try {
        const txnRes = await api.get('/transactions');
        if (txnRes.data && Array.isArray(txnRes.data.data)) {
          setTransactions(txnRes.data.data.slice(0, 5));
        } else if (Array.isArray(txnRes.data)) {
          setTransactions(txnRes.data.slice(0, 5));
        }
      } catch (txnErr) {
        console.warn('Gagal memuat transaksi:', txnErr);
      }

      // 3. Fetch incoming bills for counter badge
      try {
        const billsRes = await api.get('/payments/incoming?status=pending');
        const billsData = billsRes.data && Array.isArray(billsRes.data.data) 
          ? billsRes.data.data 
          : Array.isArray(billsRes.data) 
          ? billsRes.data 
          : [];
        setPendingBillsCount(billsData.length);
      } catch (_) {
        // ignore count error
      }

    } catch (err) {
      console.error('Gagal memuat dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('ipay_token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [navigate]);

  const handleCopyId = () => {
    const ipayId = wallet?.ipay_id || localStorage.getItem('ipay_user_id');
    if (!ipayId) return;
    navigator.clipboard.writeText(ipayId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleQuickSearchBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBillCode.trim()) return;
    navigate(`/bills?code=${encodeURIComponent(quickBillCode.trim())}`);
  };

  const userName = wallet?.name || localStorage.getItem('ipay_user_name') || 'User iPay';
  const ipayId = wallet?.ipay_id || localStorage.getItem('ipay_user_id') || '-';

  return (
    <AppLayout activeTab="home">
      {/* ─── DESKTOP WIDESCREEN GRID ─────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
        className="dashboard-grid"
      >
        {/* LEFT COLUMN: Main Dashboard Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Welcome & Balance Hero */}
          <BalanceCard
            balance={wallet?.balance || 0}
            ipayId={ipayId}
            onTopUpPressed={() => navigate('/topup')}
            onTransferPressed={() => navigate('/transfer')}
            onScanPressed={() => navigate('/scan')}
          />

          {/* Quick Actions Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Layanan & Fitur Utama
              </h2>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Pilih transaksi favorit Anda</span>
            </div>
            <QuickAction />
          </div>

          {/* Recent Transactions Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Transaksi Terbaru
                </h2>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Aktivitas dompet digital terakhir Anda
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/history')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4F46E5',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Lihat Semua</span>
                <ChevronRightIcon size={16} color="#4F46E5" />
              </button>
            </div>

            <TransactionList
              transactions={transactions}
              loading={loading}
              onItemClick={() => navigate('/history')}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Widgets (Web Desktop layout) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* User & Wallet Information Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WalletIcon size={18} color="#4F46E5" />
              <span>Informasi Akun Wallet</span>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>iPay ID Anda:</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#4F46E5', letterSpacing: '0.5px' }}>
                  {ipayId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  style={{
                    backgroundColor: '#EEF2FF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: '#4F46E5',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CopyIcon size={14} color="#4F46E5" />
                  <span>{copiedId ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Pemilik Akun</span>
                <strong style={{ color: '#0F172A' }}>{userName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Status Keamanan</span>
                <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheckIcon size={16} color="#059669" />
                  Terverifikasi (PIN 6-digit)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Pay Bill / Search Widget */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ReceiptIcon size={18} color="#F59E0B" />
              <span>Cek & Bayar Tagihan Cepat</span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px', lineHeight: '1.4' }}>
              Punya Kode Pembayaran atau ID Tagihan? Masukkan di bawah untuk bayar langsung.
            </p>

            <form onSubmit={handleQuickSearchBill} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={quickBillCode}
                onChange={(e) => setQuickBillCode(e.target.value)}
                placeholder="Contoh: PAY-12345"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #E2E8F0',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 14px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'inherit',
                }}
              >
                <SearchIcon size={16} color="#FFFFFF" />
                <span>Cari</span>
              </button>
            </form>

            {pendingBillsCount > 0 && (
              <div
                onClick={() => navigate('/bills')}
                style={{
                  marginTop: '16px',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#92400E' }}>
                    Ada {pendingBillsCount} tagihan masuk menunggu bayar
                  </span>
                </div>
                <ChevronRightIcon size={16} color="#D97706" />
              </div>
            )}
          </div>

          {/* Quick QR Shortcut Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #312E81 0%, #4338CA 100%)',
              borderRadius: '16px',
              padding: '20px',
              color: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(49, 46, 129, 0.25)',
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>QR Code iPay</div>
              <p style={{ fontSize: '12px', color: '#C7D2FE', marginBottom: '16px', lineHeight: '1.4' }}>
                Tampilkan Kode QR Anda atau Pindai QR pengguna lain untuk pembayaran instant tanpa perlu mengetik iPay ID.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/my-qr')}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    color: '#312E81',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  QR Saya
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/scan')}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Scan QR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
