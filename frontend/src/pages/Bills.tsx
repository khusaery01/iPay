import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppLayout } from '../layouts/AppLayout';
import { AppBar } from '../components/AppBar';
import { StatusBadge } from '../components/StatusBadge';
import { CustomButton } from '../components/CustomButton';
import { CustomTextField } from '../components/CustomTextField';
import { PinInputDialog } from '../components/PinInputDialog';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { SuccessReceiptModal } from '../components/SuccessReceiptModal';
import {
  ReceiptIcon,
  SearchIcon,
  FilterIcon,
  AlertCircleIcon,
  WalletIcon,
  BuildingIcon,
  CreditCardIcon,
  CloseIcon,
  ChevronRightIcon,
} from '../components/Icons';
import type { PaymentRequest } from '../types';

export const Bills: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'accepted' | 'all'>('all');
  
  const [incomingRequests, setIncomingRequests] = useState<PaymentRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<PaymentRequest[]>([]);
  const [loadingIncoming, setLoadingIncoming] = useState(false);
  const [loadingOutgoing, setLoadingOutgoing] = useState(false);
  const [incomingError, setIncomingError] = useState<string | null>(null);
  const [outgoingError, setOutgoingError] = useState<string | null>(null);

  // Search state
  const [searchCode, setSearchCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedBill, setSearchedBill] = useState<PaymentRequest | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Modal states
  const [selectedBillForDetail, setSelectedBillForDetail] = useState<PaymentRequest | null>(null);
  const [selectedBillForPay, setSelectedBillForPay] = useState<PaymentRequest | null>(null);
  const [paymentSource, setPaymentSource] = useState<string>('ipay');
  const [simulatedStatus, setSimulatedStatus] = useState<'success' | 'failed'>('success');
  
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  const [billToReject, setBillToReject] = useState<PaymentRequest | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  const [successReceipt, setSuccessReceipt] = useState<{
    res: any;
    bill: PaymentRequest;
    source: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

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
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Fetch incoming
  const fetchIncoming = useCallback(async () => {
    try {
      setLoadingIncoming(true);
      setIncomingError(null);
      const res = await api.get('/payments/incoming');
      const data = res.data && Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setIncomingRequests(data);
    } catch (err: any) {
      setIncomingError(err.response?.data?.message || err.message || 'Gagal memuat tagihan masuk.');
    } finally {
      setLoadingIncoming(false);
    }
  }, []);

  // Fetch outgoing
  const fetchOutgoing = useCallback(async () => {
    try {
      setLoadingOutgoing(true);
      setOutgoingError(null);
      const res = await api.get('/payments/outgoing');
      const data = res.data && Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setOutgoingRequests(data);
    } catch (err: any) {
      setOutgoingError(err.response?.data?.message || err.message || 'Gagal memuat tagihan dibuat.');
    } finally {
      setLoadingOutgoing(false);
    }
  }, []);

  useEffect(() => {
    fetchIncoming();
    fetchOutgoing();
  }, [fetchIncoming, fetchOutgoing]);

  // Handle Search
  const handleSearchBill = async () => {
    const query = searchCode.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchedBill(null);

    // Search local list first
    const found = incomingRequests.find(
      (req) =>
        req.payment_code === query ||
        req.id.toString() === query ||
        (req.transaction && req.transaction.otp_code === query)
    );

    if (found) {
      setSearchedBill(found);
      setIsSearching(false);
    } else {
      const intId = parseInt(query, 10);
      if (!isNaN(intId)) {
        try {
          const res = await api.get(`/payments/${intId}`);
          const data = res.data?.data || res.data;
          setSearchedBill(data);
        } catch {
          setSearchError(`Tagihan dengan ID/Kode "${query}" tidak ditemukan.`);
        } finally {
          setIsSearching(false);
        }
      } else {
        setIsSearching(false);
        setSearchError(`Tagihan dengan kode "${query}" tidak ditemukan di daftar tagihan masuk Anda.`);
      }
    }
  };

  // Handle Payment
  const handleStartPay = (bill: PaymentRequest) => {
    setSelectedBillForDetail(null);
    setSelectedBillForPay(bill);
    setPaymentSource('ipay');
    setSimulatedStatus('success');
  };

  const handleProceedToPin = () => {
    setShowPinDialog(true);
  };

  const handlePinSubmit = async (pin: string) => {
    if (!selectedBillForPay) return;

    try {
      setIsProcessingPay(true);
      const res = await api.post(`/payments/${selectedBillForPay.id}/pay`, {
        pin,
        source: paymentSource,
        simulated_status: simulatedStatus,
      });

      setShowPinDialog(false);
      const billPaid = selectedBillForPay;
      setSelectedBillForPay(null);

      // Refresh list
      fetchIncoming();
      fetchOutgoing();
      setSearchedBill(null);
      setSearchCode('');

      // Show receipt modal
      setSuccessReceipt({
        res: res.data,
        bill: billPaid,
        source: paymentSource,
      });
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Pembayaran gagal.', 'error');
    } finally {
      setIsProcessingPay(false);
    }
  };

  // Handle Reject
  const handleConfirmReject = async () => {
    if (!billToReject) return;

    try {
      setIsRejecting(true);
      await api.post(`/payments/${billToReject.id}/reject`);
      showToast('Tagihan pembayaran ditolak.', 'success');
      setBillToReject(null);
      setSelectedBillForDetail(null);
      setSearchedBill(null);
      fetchIncoming();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Gagal menolak tagihan.', 'error');
    } finally {
      setIsRejecting(false);
    }
  };

  const filteredIncoming = incomingRequests.filter((item) => {
    if (statusFilter === 'all') return true;
    return (item.status || '').toLowerCase() === statusFilter;
  });

  return (
    <AppLayout activeTab="bills">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
            backgroundColor: toastMessage.type === 'error' ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          }}
        >
          {toastMessage.text}
        </div>
      )}

      {/* AppBar with Tabs */}
      <AppBar
        title="Bayar Tagihan"
        showBack
        onBack={() => navigate('/home')}
        tabs={[
          {
            label: 'Tagihan Masuk',
            active: activeTab === 'incoming',
            onClick: () => setActiveTab('incoming'),
          },
          {
            label: 'Tagihan Dibuat',
            active: activeTab === 'outgoing',
            onClick: () => setActiveTab('outgoing'),
          },
        ]}
      />

      <div style={{ padding: '0 0 16px 0' }}>
        {/* Search Section */}
        <div
          style={{
            padding: '16px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <CustomTextField
                label="Cari dengan Kode / ID Tagihan:"
                placeholder="Contoh: 781962 atau ID 1"
                prefixIcon={<SearchIcon size={18} />}
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                style={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ paddingTop: '24px' }}>
              <button
                type="button"
                onClick={handleSearchBill}
                disabled={isSearching || !searchCode.trim()}
                style={{
                  height: '48px',
                  padding: '0 18px',
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isSearching || !searchCode.trim() ? 'not-allowed' : 'pointer',
                  opacity: isSearching || !searchCode.trim() ? 0.6 : 1,
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSearching ? (
                  <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#FFFFFF' }} />
                ) : (
                  'Cari'
                )}
              </button>
            </div>
          </div>

          {/* Search Result Card */}
          {searchedBill && (
            <div
              onClick={() => setSelectedBillForDetail(searchedBill)}
              style={{
                marginTop: '12px',
                padding: '12px 14px',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1.5px solid #4F46E5',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F172A' }}>
                  {searchedBill.description || 'Tagihan Ditemukan'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Dari: {searchedBill.requester?.name || '-'} ({searchedBill.requester?.ipay_id || '-'})
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#4F46E5' }}>
                  {formatRupiah(searchedBill.amount)}
                </span>
                <ChevronRightIcon size={18} color="#4F46E5" />
              </div>
            </div>
          )}

          {searchError && (
            <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#EF4444' }}>
              {searchError}
            </div>
          )}
        </div>

        {/* Filter Chips Bar (Khusus Tab Tagihan Masuk) */}
        {activeTab === 'incoming' && (
          <div
            style={{
              padding: '10px 16px',
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
              <FilterIcon size={16} />
            </div>

            {[
              { label: 'Menunggu Bayar', val: 'pending' },
              { label: 'Selesai', val: 'accepted' },
              { label: 'Semua Tagihan', val: 'all' },
            ].map((chip) => {
              const isSelected = statusFilter === chip.val;
              return (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => setStatusFilter(chip.val as any)}
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
        )}

        {/* Content Tab 1: Incoming */}
        {activeTab === 'incoming' && (
          <div style={{ padding: '16px' }}>
            {loadingIncoming && incomingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 12px auto' }} />
                <p style={{ fontSize: '13.5px' }}>Memuat daftar tagihan masuk...</p>
              </div>
            ) : incomingError && incomingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                <div style={{ color: '#EF4444', marginBottom: '12px' }}>
                  <AlertCircleIcon size={44} />
                </div>
                <p style={{ fontSize: '14px', marginBottom: '16px' }}>{incomingError}</p>
                <button
                  type="button"
                  onClick={fetchIncoming}
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
            ) : filteredIncoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
                <div style={{ marginBottom: '12px', opacity: 0.7 }}>
                  <ReceiptIcon size={48} />
                </div>
                <p style={{ fontSize: '14px' }}>
                  {statusFilter === 'pending'
                    ? 'Tidak ada tagihan yang menunggu pembayaran.'
                    : 'Belum ada tagihan pada kategori ini.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredIncoming.map((bill) => {
                  const isPending = (bill.status || '').toLowerCase() === 'pending';

                  return (
                    <div
                      key={bill.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        padding: '16px',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Header */}
                      <div
                        onClick={() => setSelectedBillForDetail(bill)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                            {bill.description || 'Tagihan Pembayaran'}
                          </span>
                          <StatusBadge status={bill.status} />
                        </div>

                        <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                          Dari: {bill.requester?.name || '-'} ({bill.requester?.ipay_id || '-'})
                        </div>

                        {bill.payment_code && (
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#4F46E5', marginTop: '2px' }}>
                            Kode Tagihan: {bill.payment_code}
                          </div>
                        )}
                      </div>

                      <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '14px 0' }} />

                      {/* Bottom Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '17px', fontWeight: 800, color: '#4F46E5' }}>
                          {formatRupiah(bill.amount)}
                        </span>

                        {isPending && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => setBillToReject(bill)}
                              style={{
                                padding: '6px 14px',
                                backgroundColor: 'transparent',
                                color: '#EF4444',
                                border: '1.5px solid #EF4444',
                                borderRadius: '10px',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              Tolak
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStartPay(bill)}
                              style={{
                                padding: '6px 18px',
                                backgroundColor: '#4F46E5',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                              }}
                            >
                              Bayar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Content Tab 2: Outgoing */}
        {activeTab === 'outgoing' && (
          <div style={{ padding: '16px' }}>
            {loadingOutgoing && outgoingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 12px auto' }} />
                <p style={{ fontSize: '13.5px' }}>Memuat daftar tagihan dibuat...</p>
              </div>
            ) : outgoingError && outgoingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                <div style={{ color: '#EF4444', marginBottom: '12px' }}>
                  <AlertCircleIcon size={44} />
                </div>
                <p style={{ fontSize: '14px', marginBottom: '16px' }}>{outgoingError}</p>
                <button
                  type="button"
                  onClick={fetchOutgoing}
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
            ) : outgoingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
                <div style={{ marginBottom: '12px', opacity: 0.7 }}>
                  <ReceiptIcon size={48} />
                </div>
                <p style={{ fontSize: '14px' }}>Belum ada tagihan yang dibuat.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {outgoingRequests.map((bill) => (
                  <div
                    key={bill.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                        {bill.description || 'Tagihan Pembayaran'}
                      </span>
                      <StatusBadge status={bill.status} />
                    </div>

                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                      Kepada: {bill.payer?.name || '-'} ({bill.payer?.ipay_id || '-'})
                    </div>

                    {bill.payment_code && (
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#4F46E5', marginTop: '4px' }}>
                        Kode Bayar 6-Digit: {bill.payment_code}
                      </div>
                    )}

                    <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '14px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                        {formatRupiah(bill.amount)}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        {formatDate(bill.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── MODAL 1: Detail Tagihan Bottom Sheet ─── */}
      {selectedBillForDetail && (
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
          onClick={() => setSelectedBillForDetail(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 -8px 30px rgba(15, 23, 42, 0.15)',
              animation: 'slideUpModal 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>
                Rincian Tagihan
              </h3>
              <button
                type="button"
                onClick={() => setSelectedBillForDetail(null)}
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

            {/* Card Ringkasan */}
            <div
              style={{
                padding: '16px',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#4F46E5', marginBottom: '6px' }}>
                {formatRupiah(selectedBillForDetail.amount)}
              </div>
              <StatusBadge status={selectedBillForDetail.status} />

              <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '16px 0' }} />

              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Penerima Dana (Pemohon)</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>
                    {selectedBillForDetail.requester?.name || '-'} ({selectedBillForDetail.requester?.ipay_id || '-'})
                  </span>
                </div>
                {selectedBillForDetail.description && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Deskripsi</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedBillForDetail.description}</span>
                  </div>
                )}
                {selectedBillForDetail.notes && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Catatan</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedBillForDetail.notes}</span>
                  </div>
                )}
                {selectedBillForDetail.payment_code && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Kode Pembayaran</span>
                    <span style={{ fontWeight: 700, color: '#4F46E5' }}>{selectedBillForDetail.payment_code}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Tanggal Dibuat</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{formatDate(selectedBillForDetail.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons if Pending */}
            {(selectedBillForDetail.status || '').toLowerCase() === 'pending' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <CustomButton
                  text="Bayar Tagihan Sekarang"
                  onClick={() => handleStartPay(selectedBillForDetail)}
                />
                <CustomButton
                  text="Tolak Permintaan Ini"
                  isOutlined
                  color="#EF4444"
                  onClick={() => setBillToReject(selectedBillForDetail)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Pilih Metode Pembayaran Bottom Sheet ─── */}
      {selectedBillForPay && (
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
          onClick={() => setSelectedBillForPay(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 -8px 30px rgba(15, 23, 42, 0.15)',
              animation: 'slideUpModal 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>
                Pilih Metode Pembayaran
              </h3>
              <button
                type="button"
                onClick={() => setSelectedBillForPay(null)}
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

            {/* Bill Summary */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#0F172A' }}>
                  {selectedBillForPay.description || 'Tagihan iPay'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Penerima: {selectedBillForPay.requester?.name || '-'}
                </div>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#4F46E5' }}>
                {formatRupiah(selectedBillForPay.amount)}
              </div>
            </div>

            {/* Sumber Dana Radios */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: '10px' }}>
                Metode Pembayaran:
              </label>

              {[
                {
                  id: 'ipay',
                  title: 'Saldo iPay',
                  sub: 'Potong dari saldo dompet iPay Anda',
                  icon: <WalletIcon size={22} color="#4F46E5" />,
                  color: '#4F46E5',
                },
                {
                  id: 'dana',
                  title: 'DANA (Simulasi)',
                  sub: 'Simulasi Pembayaran E-Wallet DANA',
                  icon: <BuildingIcon size={22} color="#108EE9" />,
                  color: '#108EE9',
                },
                {
                  id: 'gopay',
                  title: 'GoPay (Simulasi)',
                  sub: 'Simulasi Pembayaran E-Wallet GoPay',
                  icon: <CreditCardIcon size={22} color="#00AED6" />,
                  color: '#00AED6',
                },
                {
                  id: 'bca',
                  title: 'BCA (Simulasi)',
                  sub: 'Simulasi Virtual Account BCA',
                  icon: <BuildingIcon size={22} color="#005DAA" />,
                  color: '#005DAA',
                },
              ].map((opt) => {
                const isSelected = paymentSource === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPaymentSource(opt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: `1.5px solid ${isSelected ? opt.color : '#E2E8F0'}`,
                      backgroundColor: isSelected ? `${opt.color}0D` : '#FFFFFF',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ marginRight: '12px' }}>{opt.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#0F172A' }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                        {opt.sub}
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => setPaymentSource(opt.id)}
                      style={{ accentColor: opt.color, cursor: 'pointer' }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Simulasi status choice */}
            {paymentSource !== 'ipay' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Status Simulasi:</span>
                <button
                  type="button"
                  onClick={() => setSimulatedStatus('success')}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    border: 'none',
                    backgroundColor: simulatedStatus === 'success' ? '#10B981' : '#F1F5F9',
                    color: simulatedStatus === 'success' ? '#FFFFFF' : '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Sukses
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedStatus('failed')}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    border: 'none',
                    backgroundColor: simulatedStatus === 'failed' ? '#EF4444' : '#F1F5F9',
                    color: simulatedStatus === 'failed' ? '#FFFFFF' : '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Gagal
                </button>
              </div>
            )}

            <CustomButton
              text="Lanjutkan & Otorisasi PIN"
              onClick={handleProceedToPin}
            />
          </div>
        </div>
      )}

      {/* ─── PIN Dialog ─── */}
      <PinInputDialog
        isOpen={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onSuccess={handlePinSubmit}
        isLoading={isProcessingPay}
        title="Konfirmasi Bayar Tagihan"
        description={`Masukkan PIN 6-digit iPay Anda untuk membayar ${
          selectedBillForPay ? formatRupiah(selectedBillForPay.amount) : ''
        } kepada ${selectedBillForPay?.requester?.name || 'Penerima'}`}
      />

      {/* ─── Confirmation Dialog for Reject ─── */}
      <ConfirmationDialog
        isOpen={Boolean(billToReject)}
        onClose={() => setBillToReject(null)}
        onConfirm={handleConfirmReject}
        title="Tolak Tagihan"
        message={`Apakah Anda yakin ingin menolak tagihan dari ${billToReject?.requester?.name || 'pemohon'}?`}
        confirmText="Tolak"
        isDanger
        isLoading={isRejecting}
      />

      {/* ─── Success Receipt Modal ─── */}
      {successReceipt && (
        <SuccessReceiptModal
          isOpen={Boolean(successReceipt)}
          onClose={() => setSuccessReceipt(null)}
          title="Pembayaran Berhasil!"
          message={successReceipt.res?.message || 'Tagihan berhasil dibayar.'}
          transactionCode={successReceipt.res?.transaction_code}
          recipientName={successReceipt.res?.paid_to || successReceipt.bill.requester?.name}
          source={successReceipt.source}
          amount={parseFloat(successReceipt.res?.amount || successReceipt.bill.amount)}
          newBalance={successReceipt.res?.new_balance ? parseFloat(successReceipt.res.new_balance) : null}
          buttonText="Selesai"
        />
      )}
    </AppLayout>
  );
};

export default Bills;
