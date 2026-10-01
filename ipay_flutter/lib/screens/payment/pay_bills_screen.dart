import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/currency_formatter.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/payment_request_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/payment_provider.dart';
import '../../providers/wallet_provider.dart';
import '../../widgets/confirmation_dialog.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_input_dialog.dart';
import '../../widgets/status_badge.dart';

class PayBillsScreen extends StatefulWidget {
  const PayBillsScreen({super.key});

  @override
  State<PayBillsScreen> createState() => _PayBillsScreenState();
}

class _PayBillsScreenState extends State<PayBillsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchCodeController = TextEditingController();
  String _selectedStatusFilter = 'all'; // 'pending', 'accepted', 'all'
  PaymentRequestModel? _searchedBill;
  bool _isSearching = false;
  String? _searchError;

  @override
  void initState() {
    super.initState();
    debugPrint('[PAY_BILLS] init');
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final authUser = context.read<AuthProvider>().user;
      debugPrint('[PAY_BILLS] current authenticated user: ${authUser?.name} (${authUser?.email}, ipayId: ${authUser?.ipayId})');
      _loadRequests();
    });
  }

  @override
  void dispose() {
    debugPrint('[PAY_BILLS] dispose');
    _tabController.dispose();
    _searchCodeController.dispose();
    super.dispose();
  }

  Future<void> _loadRequests() async {
    final paymentProvider = context.read<PaymentProvider>();
    await paymentProvider.loadAllRequests();
  }

  void _handleSearchBill() {
    final query = _searchCodeController.text.trim();
    if (query.isEmpty) return;

    setState(() {
      _isSearching = true;
      _searchError = null;
      _searchedBill = null;
    });

    final paymentProvider = context.read<PaymentProvider>();
    PaymentRequestModel? found;
    for (final req in paymentProvider.incomingRequests) {
      if (req.paymentCode == query ||
          req.id.toString() == query ||
          req.transaction?.otpCode == query) {
        found = req;
        break;
      }
    }

    if (found != null) {
      setState(() {
        _searchedBill = found;
        _isSearching = false;
      });
    } else {
      final intId = int.tryParse(query);
      if (intId != null) {
        paymentProvider.getPaymentRequest(intId).then((res) {
          if (mounted) {
            setState(() {
              _searchedBill = res;
              _isSearching = false;
              if (res == null) {
                _searchError = 'Tagihan dengan ID/Kode "$query" tidak ditemukan.';
              }
            });
          }
        });
      } else {
        setState(() {
          _isSearching = false;
          _searchError =
              'Tagihan dengan kode "$query" tidak ditemukan di daftar tagihan masuk Anda.';
        });
      }
    }
  }

  List<PaymentRequestModel> _filterIncoming(List<PaymentRequestModel> list) {
    if (_selectedStatusFilter == 'all') return list;
    return list.where((item) => item.status == _selectedStatusFilter).toList();
  }

  void _showBillDetailModal(PaymentRequestModel bill) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Rincian Tagihan',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(modalContext),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Card Ringkasan
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  Text(
                    CurrencyFormatter.formatRupiah(bill.amount),
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  StatusBadge(status: bill.status),
                  const Divider(height: 20),
                  _buildDetailItem(
                    'Penerima Dana (Pemohon)',
                    '${bill.requester?.name ?? '-'} (${bill.requester?.ipayId ?? '-'})',
                  ),
                  if (bill.description != null && bill.description!.isNotEmpty)
                    _buildDetailItem('Deskripsi', bill.description!),
                  if (bill.notes != null && bill.notes!.isNotEmpty)
                    _buildDetailItem('Catatan', bill.notes!),
                  if (bill.paymentCode != null)
                    _buildDetailItem('Kode Pembayaran', bill.paymentCode!),
                  _buildDetailItem(
                    'Tanggal Dibuat',
                    DateFormatter.formatDateTime(bill.createdAt),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            if (bill.status == 'pending') ...[
              CustomButton(
                text: 'Bayar Tagihan Sekarang',
                onPressed: () {
                  Navigator.pop(modalContext);
                  _showPaymentSourceModal(bill);
                },
              ),
              const SizedBox(height: 10),
              OutlinedButton(
                onPressed: () {
                  Navigator.pop(modalContext);
                  _handleReject(bill);
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.error,
                  side: const BorderSide(color: AppColors.error),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Tolak Permintaan Ini',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showPaymentSourceModal(PaymentRequestModel request) {
    String selectedSource = 'ipay';
    String simulatedStatus = 'success';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) => StatefulBuilder(
        builder: (context, setStateModal) => Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Pilih Metode Pembayaran',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(modalContext),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Detail summary
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          request.description ?? 'Tagihan iPay',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Penerima: ${request.requester?.name ?? '-'}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      CurrencyFormatter.formatRupiah(request.amount),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),
              const Text(
                'Metode Pembayaran:',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 10),

              _buildPaymentOption(
                value: 'ipay',
                title: 'Saldo iPay',
                subtitle: 'Potong dari saldo dompet iPay Anda',
                icon: Icons.account_balance_wallet,
                color: AppColors.primary,
                groupValue: selectedSource,
                onChanged: (val) => setStateModal(() => selectedSource = val!),
              ),
              _buildPaymentOption(
                value: 'dana',
                title: 'DANA (Simulasi)',
                subtitle: 'Simulasi Pembayaran E-Wallet DANA',
                icon: Icons.account_balance,
                color: const Color(0xFF108EE9),
                groupValue: selectedSource,
                onChanged: (val) => setStateModal(() => selectedSource = val!),
              ),
              _buildPaymentOption(
                value: 'gopay',
                title: 'GoPay (Simulasi)',
                subtitle: 'Simulasi Pembayaran E-Wallet GoPay',
                icon: Icons.mobile_friendly,
                color: const Color(0xFF00AED6),
                groupValue: selectedSource,
                onChanged: (val) => setStateModal(() => selectedSource = val!),
              ),
              _buildPaymentOption(
                value: 'bca',
                title: 'BCA (Simulasi)',
                subtitle: 'Simulasi Virtual Account BCA',
                icon: Icons.credit_card,
                color: const Color(0xFF005DAA),
                groupValue: selectedSource,
                onChanged: (val) => setStateModal(() => selectedSource = val!),
              ),

              if (selectedSource != 'ipay') ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Text('Status Simulasi: '),
                    ChoiceChip(
                      label: const Text('Sukses'),
                      selected: simulatedStatus == 'success',
                      onSelected: (sel) {
                        if (sel) {
                          setStateModal(() => simulatedStatus = 'success');
                        }
                      },
                    ),
                    const SizedBox(width: 8),
                    ChoiceChip(
                      label: const Text('Gagal'),
                      selected: simulatedStatus == 'failed',
                      onSelected: (sel) {
                        if (sel) {
                          setStateModal(() => simulatedStatus = 'failed');
                        }
                      },
                    ),
                  ],
                ),
              ],

              const SizedBox(height: 24),

              CustomButton(
                text: 'Lanjutkan & Otorisasi PIN',
                onPressed: () {
                  Navigator.pop(modalContext);
                  _processPay(request, selectedSource, simulatedStatus);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentOption({
    required String value,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required String groupValue,
    required ValueChanged<String?> onChanged,
  }) {
    final isSelected = groupValue == value;
    return InkWell(
      onTap: () => onChanged(value),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.08) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? color : const Color(0xFFE2E8F0),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Radio<String>(
              value: value,
              groupValue: groupValue,
              onChanged: onChanged,
              activeColor: color,
            ),
          ],
        ),
      ),
    );
  }

  void _processPay(
    PaymentRequestModel request,
    String source,
    String simulatedStatus,
  ) async {
    if (source == 'ipay') {
      final user = context.read<AuthProvider>().user;
      final walletBalance = context.read<WalletProvider>().balance;
      final balance =
          walletBalance > 0 ? walletBalance : (user?.balance ?? 0.0);

      if (request.amount > balance) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Saldo iPay tidak mencukupi (${CurrencyFormatter.formatRupiah(balance)}).',
              ),
              backgroundColor: AppColors.error,
            ),
          );
        }
        return;
      }
    }

    final pin = await PinInputDialog.show(
      context,
      title: 'Konfirmasi Bayar Tagihan',
      description:
          'Masukkan PIN 6-digit iPay Anda untuk membayar ${CurrencyFormatter.formatRupiah(request.amount)} kepada ${request.requester?.name ?? 'Penerima'}',
    );

    if (pin == null || pin.isEmpty || !mounted) return;

    final paymentProvider = context.read<PaymentProvider>();
    final res = await paymentProvider.payRequest(
      id: request.id,
      pin: pin,
      source: source,
      simulatedStatus: simulatedStatus,
    );

    if (mounted) {
      if (res != null) {
        await context.read<WalletProvider>().fetchBalance();
        if (mounted) await context.read<AuthProvider>().refreshProfile();
        if (mounted) await _loadRequests();

        setState(() {
          _searchedBill = null;
          _searchCodeController.clear();
        });

        if (mounted) {
          _showSuccessReceiptDialog(res, request, source);
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              paymentProvider.errorMessage ?? 'Pembayaran tagihan gagal.',
            ),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _showSuccessReceiptDialog(
    Map<String, dynamic> res,
    PaymentRequestModel bill,
    String source,
  ) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        contentPadding: const EdgeInsets.all(24),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: const BoxDecoration(
                color: AppColors.successBg,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle_rounded,
                color: AppColors.success,
                size: 40,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Pembayaran Berhasil!',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              res['message'] ?? 'Tagihan berhasil dibayar.',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  _buildReceiptRow(
                    'Kode Transaksi',
                    res['transaction_code'] ?? '-',
                  ),
                  const Divider(height: 14),
                  _buildReceiptRow(
                    'Dibayarkan Kepada',
                    res['paid_to'] ?? (bill.requester?.name ?? '-'),
                  ),
                  const Divider(height: 14),
                  _buildReceiptRow('Sumber Dana', source.toUpperCase()),
                  const Divider(height: 14),
                  _buildReceiptRow(
                    'Jumlah Pembayaran',
                    CurrencyFormatter.formatRupiah(
                      double.tryParse(res['amount'].toString()) ?? bill.amount,
                    ),
                    valueColor: AppColors.success,
                    isBold: true,
                  ),
                  if (res['new_balance'] != null) ...[
                    const Divider(height: 14),
                    _buildReceiptRow(
                      'Sisa Saldo iPay',
                      CurrencyFormatter.formatRupiah(
                        double.tryParse(res['new_balance'].toString()) ?? 0.0,
                      ),
                      valueColor: AppColors.primary,
                      isBold: true,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(dialogCtx),
                child: const Text('Selesai'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleReject(PaymentRequestModel request) async {
    final confirm = await ConfirmationDialog.show(
      context,
      title: 'Tolak Tagihan',
      message:
          'Apakah Anda yakin ingin menolak tagihan dari ${request.requester?.name}?',
      confirmText: 'Tolak',
      isDanger: true,
    );

    if (confirm != true || !mounted) return;

    final success =
        await context.read<PaymentProvider>().rejectRequest(request.id);
    if (mounted && success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tagihan pembayaran ditolak.')),
      );
      setState(() {
        _searchedBill = null;
      });
      _loadRequests();
    }
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedStatusFilter == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: AppColors.primary,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : AppColors.textPrimary,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        fontSize: 12,
      ),
      backgroundColor: AppColors.background,
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _selectedStatusFilter = value;
          });
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    debugPrint('[PAY_BILLS] build');
    final paymentProvider = context.watch<PaymentProvider>();
    final filteredIncoming = _filterIncoming(paymentProvider.incomingRequests);
    final pendingCount = paymentProvider.incomingRequests
        .where((item) => item.status == 'pending')
        .length;
    final acceptedCount = paymentProvider.incomingRequests
        .where((item) => item.status == 'accepted')
        .length;

    debugPrint(
        '[PAY_BILLS] item yang akhirnya dirender UI: ${filteredIncoming.length} items (incoming total: ${paymentProvider.incomingRequests.length}, pending count: $pendingCount, accepted count: $acceptedCount, filtered count: ${filteredIncoming.length}, selectedFilter: $_selectedStatusFilter)');

    final screenWidget = PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        debugPrint('[PAY_BILLS] onPopInvoked didPop=$didPop');
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Bayar Tagihan'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            tooltip: 'Kembali',
            onPressed: () {
              debugPrint('[PAY_BILLS] back button pressed in AppBar');
              if (Navigator.of(context).canPop()) {
                Navigator.of(context).pop();
              } else {
                context.go('/home');
              }
            },
          ),
          bottom: TabBar(
            controller: _tabController,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textSecondary,
            indicatorColor: AppColors.primary,
            tabs: const [
              Tab(text: 'Tagihan Masuk'),
              Tab(text: 'Tagihan Dibuat'),
            ],
          ),
        ),
      body: SafeArea(
        child: Column(
          children: [

            // Search / Input Kode Tagihan Section
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: AppColors.surface,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: CustomTextField(
                          controller: _searchCodeController,
                          label: 'Cari dengan Kode / ID Tagihan:',
                          hint: 'Contoh: 781962 atau ID 1',
                          prefixIcon: Icons.pin,
                          keyboardType: TextInputType.text,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Padding(
                        padding: const EdgeInsets.only(top: 24.0),
                        child: SizedBox(
                          height: 52,
                          child: ElevatedButton(
                            onPressed: _isSearching ? null : _handleSearchBill,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: _isSearching
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text('Cari'),
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Search Result Card
                  if (_searchedBill != null) ...[
                    const SizedBox(height: 12),
                    InkWell(
                      onTap: () => _showBillDetailModal(_searchedBill!),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.primary),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _searchedBill!.description ?? 'Tagihan Ditemukan',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                                Text(
                                  'Dari: ${_searchedBill!.requester?.name ?? '-'} (${_searchedBill!.requester?.ipayId ?? '-'})',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                Text(
                                  CurrencyFormatter.formatRupiah(
                                    _searchedBill!.amount,
                                  ),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primary,
                                    fontSize: 15,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                const Icon(
                                  Icons.chevron_right,
                                  color: AppColors.primary,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],

                  if (_searchError != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      _searchError!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.error,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const Divider(height: 1),

            // Filter Chips Bar (Khusus Tab Tagihan Masuk)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: AppColors.surface,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    const Icon(Icons.filter_list, size: 18, color: AppColors.textSecondary),
                    const SizedBox(width: 8),
                    _buildFilterChip('Menunggu Bayar', 'pending'),
                    const SizedBox(width: 6),
                    _buildFilterChip('Selesai', 'accepted'),
                    const SizedBox(width: 6),
                    _buildFilterChip('Semua Tagihan', 'all'),
                  ],
                ),
              ),
            ),
            const Divider(height: 1),

            // Tab Views
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  // Tab 1: Incoming requests
                  RefreshIndicator(
                    onRefresh: _loadRequests,
                    child: paymentProvider.isLoadingIncoming &&
                            paymentProvider.incomingRequests.isEmpty
                        ? const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                CircularProgressIndicator(),
                                SizedBox(height: 12),
                                Text(
                                  'Memuat daftar tagihan masuk...',
                                  style: TextStyle(color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          )
                        : paymentProvider.incomingError != null &&
                                paymentProvider.incomingRequests.isEmpty
                            ? Center(
                                child: Padding(
                                  padding: const EdgeInsets.all(24.0),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(
                                        Icons.error_outline,
                                        size: 48,
                                        color: AppColors.error,
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        paymentProvider.incomingError!,
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(
                                            color: AppColors.textSecondary),
                                      ),
                                      const SizedBox(height: 16),
                                      ElevatedButton(
                                        onPressed: _loadRequests,
                                        child: const Text('Coba Lagi'),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                            : filteredIncoming.isEmpty
                                ? Center(
                                    child: Padding(
                                      padding: const EdgeInsets.all(24.0),
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          const Icon(
                                            Icons.receipt_long_outlined,
                                            size: 48,
                                            color: AppColors.textMuted,
                                          ),
                                          const SizedBox(height: 12),
                                          Text(
                                            _selectedStatusFilter == 'pending'
                                                ? 'Tidak ada tagihan yang menunggu pembayaran.'
                                                : 'Belum ada tagihan pada kategori ini.',
                                            style: const TextStyle(
                                                color: AppColors.textMuted),
                                            textAlign: TextAlign.center,
                                          ),
                                        ],
                                      ),
                                    ),
                                  )
                                : ListView.builder(
                                    padding: const EdgeInsets.all(16),
                                    itemCount: filteredIncoming.length,
                                    itemBuilder: (context, index) {
                                      final req = filteredIncoming[index];
                                      final isPending = req.status == 'pending';

                                      return Card(
                                        margin:
                                            const EdgeInsets.only(bottom: 12),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(16),
                                        ),
                                        child: InkWell(
                                          onTap: () =>
                                              _showBillDetailModal(req),
                                          borderRadius:
                                              BorderRadius.circular(16),
                                          child: Padding(
                                            padding:
                                                const EdgeInsets.all(16.0),
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .spaceBetween,
                                                  children: [
                                                    Expanded(
                                                      child: Text(
                                                        req.description ??
                                                            'Tagihan Pembayaran',
                                                        style: const TextStyle(
                                                          fontWeight:
                                                              FontWeight.bold,
                                                          fontSize: 15,
                                                        ),
                                                      ),
                                                    ),
                                                    StatusBadge(
                                                        status: req.status),
                                                  ],
                                                ),
                                                const SizedBox(height: 6),
                                                Text(
                                                  'Dari: ${req.requester?.name ?? '-'} (${req.requester?.ipayId ?? '-'})',
                                                  style: const TextStyle(
                                                    color:
                                                        AppColors.textSecondary,
                                                    fontSize: 13,
                                                  ),
                                                ),
                                                if (req.paymentCode != null)
                                                  Padding(
                                                    padding:
                                                        const EdgeInsets.only(
                                                            top: 2.0),
                                                    child: Text(
                                                      'Kode Tagihan: ${req.paymentCode}',
                                                      style: const TextStyle(
                                                        color:
                                                            AppColors.primary,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        fontSize: 12,
                                                      ),
                                                    ),
                                                  ),
                                                const Divider(height: 20),
                                                Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .spaceBetween,
                                                  children: [
                                                    Text(
                                                      CurrencyFormatter
                                                          .formatRupiah(
                                                        req.amount,
                                                      ),
                                                      style: const TextStyle(
                                                        fontSize: 17,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        color:
                                                            AppColors.primary,
                                                      ),
                                                    ),
                                                    if (isPending)
                                                      Row(
                                                        children: [
                                                          OutlinedButton(
                                                            onPressed: () =>
                                                                _handleReject(
                                                                    req),
                                                            style:
                                                                OutlinedButton
                                                                    .styleFrom(
                                                              foregroundColor:
                                                                  AppColors
                                                                      .error,
                                                              side:
                                                                  const BorderSide(
                                                                color: AppColors
                                                                    .error,
                                                              ),
                                                              padding:
                                                                  const EdgeInsets
                                                                      .symmetric(
                                                                horizontal: 12,
                                                                vertical: 6,
                                                              ),
                                                            ),
                                                            child: const Text(
                                                                'Tolak'),
                                                          ),
                                                          const SizedBox(
                                                              width: 8),
                                                          ElevatedButton(
                                                            onPressed: () =>
                                                                _showPaymentSourceModal(
                                                              req,
                                                            ),
                                                            style:
                                                                ElevatedButton
                                                                    .styleFrom(
                                                              padding:
                                                                  const EdgeInsets
                                                                      .symmetric(
                                                                horizontal: 16,
                                                                vertical: 6,
                                                              ),
                                                            ),
                                                            child: const Text(
                                                                'Bayar'),
                                                          ),
                                                        ],
                                                      ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                  ),

                  // Tab 2: Outgoing requests
                  RefreshIndicator(
                    onRefresh: _loadRequests,
                    child: paymentProvider.isLoadingOutgoing &&
                            paymentProvider.outgoingRequests.isEmpty
                        ? const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                CircularProgressIndicator(),
                                SizedBox(height: 12),
                                Text(
                                  'Memuat daftar tagihan dibuat...',
                                  style: TextStyle(color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          )
                        : paymentProvider.outgoingError != null &&
                                paymentProvider.outgoingRequests.isEmpty
                            ? Center(
                                child: Padding(
                                  padding: const EdgeInsets.all(24.0),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(
                                        Icons.error_outline,
                                        size: 48,
                                        color: AppColors.error,
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        paymentProvider.outgoingError!,
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(
                                            color: AppColors.textSecondary),
                                      ),
                                      const SizedBox(height: 16),
                                      ElevatedButton(
                                        onPressed: _loadRequests,
                                        child: const Text('Coba Lagi'),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                            : paymentProvider.outgoingRequests.isEmpty
                                ? const Center(
                                    child: Padding(
                                      padding: EdgeInsets.all(24.0),
                                      child: Text(
                                        'Belum ada tagihan yang dibuat.',
                                        style: TextStyle(
                                            color: AppColors.textMuted),
                                      ),
                                    ),
                                  )
                                : ListView.builder(
                                    padding: const EdgeInsets.all(16),
                                    itemCount:
                                        paymentProvider.outgoingRequests.length,
                                    itemBuilder: (context, index) {
                                      final req = paymentProvider
                                          .outgoingRequests[index];
                                      return Card(
                                        margin:
                                            const EdgeInsets.only(bottom: 12),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(16),
                                        ),
                                        child: Padding(
                                          padding: const EdgeInsets.all(16.0),
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Row(
                                                mainAxisAlignment:
                                                    MainAxisAlignment
                                                        .spaceBetween,
                                                children: [
                                                  Expanded(
                                                    child: Text(
                                                      req.description ??
                                                          'Tagihan Pembayaran',
                                                      style: const TextStyle(
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        fontSize: 15,
                                                      ),
                                                    ),
                                                  ),
                                                  StatusBadge(
                                                      status: req.status),
                                                ],
                                              ),
                                              const SizedBox(height: 6),
                                              Text(
                                                'Kepada: ${req.payer?.name ?? '-'} (${req.payer?.ipayId ?? '-'})',
                                                style: const TextStyle(
                                                  color:
                                                      AppColors.textSecondary,
                                                  fontSize: 13,
                                                ),
                                              ),
                                              if (req.paymentCode != null) ...[
                                                const SizedBox(height: 4),
                                                Text(
                                                  'Kode Bayar 6-Digit: ${req.paymentCode}',
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    color: AppColors.primary,
                                                  ),
                                                ),
                                              ],
                                              const Divider(height: 20),
                                              Row(
                                                mainAxisAlignment:
                                                    MainAxisAlignment
                                                        .spaceBetween,
                                                children: [
                                                  Text(
                                                    CurrencyFormatter
                                                        .formatRupiah(
                                                      req.amount,
                                                    ),
                                                    style: const TextStyle(
                                                      fontSize: 17,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color: AppColors
                                                          .textPrimary,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  );
  debugPrint('[PAY_BILLS] build complete');
  return screenWidget;
}

  Widget _buildDetailItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReceiptRow(
    String label,
    String value, {
    Color? valueColor,
    bool isBold = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isBold ? 14 : 12,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            color: valueColor ?? AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
