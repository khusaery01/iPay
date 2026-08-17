import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import { BalanceCard } from '../components/BalanceCard';
import { QuickAction } from '../components/QuickAction';
import { TransactionList } from '../components/TransactionList';
import type { Transaction } from '../types';

interface WalletData {
  ipay_id: string;
  name: string;
  balance: number;
}

const Home: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // 1. Ambil data wallet (saldo & profil)
      const walletRes = await api.get<WalletData>('/wallet');
      setWallet(walletRes.data);

      // 2. Ambil riwayat transaksi terbaru (jika endpoint tersedia)
      try {
        const txnRes = await api.get('/transactions');
        if (txnRes.data && Array.isArray(txnRes.data.data)) {
          setTransactions(txnRes.data.data.slice(0, 5)); // 5 transaksi terbaru
        }
      } catch (txnErr) {
        console.warn('Gagal memuat riwayat transaksi:', txnErr);
      }
    } catch (err: any) {
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

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Gagal logout di server:', err);
    } finally {
      localStorage.removeItem('ipay_token');
      localStorage.removeItem('ipay_user_name');
      localStorage.removeItem('ipay_user_id');
      navigate('/login');
    }
  };

  const handleActionClick = (actionName: string) => {
    if (actionName === 'Top Up') {
      navigate('/topup');
    } else if (actionName === 'Kirim') {
      navigate('/transfer');
    } else if (actionName === 'Minta') {
      navigate('/request-payment');
    } else if (actionName === 'Bayar') {
      navigate('/bills');
    } else {
      setModalMessage(`Fitur "${actionName}" akan dibuka pada tahap implementasi fitur pembayaran berikutnya.`);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'home') {
      setActiveTab('home');
    } else if (tab === 'bills') {
      navigate('/bills');
    } else {
      setModalMessage(`Menu "${tab.toUpperCase()}" akan tersedia pada tahap pengembangan berikutnya.`);
    }
  };

  return (
    <AppLayout
      userName={wallet?.name || localStorage.getItem('ipay_user_name') || 'Pengguna'}
      onLogout={handleLogout}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="dashboard-grid">
        <div className="dashboard-left-column">
          {/* Kartu Saldo */}
          <div className="stagger-dashboard-item" style={{ animationDelay: '80ms' }}>
            <BalanceCard
              balance={wallet?.balance || 0}
              ipayId={wallet?.ipay_id || localStorage.getItem('ipay_user_id') || ''}
            />
          </div>

          {/* Layanan Cepat (Top Up, Kirim, Minta, Bayar) */}
          <div className="stagger-dashboard-item" style={{ animationDelay: '160ms' }}>
            <QuickAction onActionClick={handleActionClick} />
          </div>

          {/* Pay Direct Banner */}
          <div className="stagger-dashboard-item" style={{ animationDelay: '240ms' }}>
            <div
              onClick={() => navigate('/pay-direct')}
              style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                border: '1.5px solid #a7f3d0',
                borderRadius: 'var(--border-radius-md)',
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#065f46', display: 'block' }}>
                  ⚡ Pay Direct (Di HP Penjual)
                </span>
                <span style={{ fontSize: '0.75rem', color: '#047857' }}>
                  Terima bayaran langsung tanpa HP pembeli
                </span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669' }}>Buka →</span>
            </div>
          </div>
        </div>

        <div className="dashboard-right-column stagger-dashboard-item" style={{ animationDelay: '320ms' }}>
          {/* Riwayat Transaksi Terbaru */}
          <TransactionList transactions={transactions} loading={loading} />
        </div>
      </div>

      {/* Modal Popup Placeholder Fitur */}
      {modalMessage && (
        <div className="modal-overlay" onClick={() => setModalMessage(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🚀</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Informasi Layanan</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
              {modalMessage}
            </p>
            <button
              onClick={() => setModalMessage(null)}
              className="btn-primary"
              style={{ width: 'auto', padding: '8px 24px' }}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Home;
