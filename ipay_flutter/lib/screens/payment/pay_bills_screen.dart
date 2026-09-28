import 'package:flutter/material.dart';
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

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadRequests();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadRequests() async {
    final paymentProvider = context.read<PaymentProvider>();
    await Future.wait([
      paymentProvider.fetchIncomingRequests(),
      paymentProvider.fetchOutgoingRequests(),
    ]);
  }

  void _showPaymentModal(PaymentRequestModel request) {
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
                          'Dari: ${request.requester?.name ?? '-'}',
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

              // Payment options radios
              _buildPaymentOption(
                value: 'ipay',
                title: 'Saldo iPay',
                subtitle: 'Potong dari saldo iPay Anda',
                icon: Icons.account_balance_wallet,
                color: AppColors.primary,
                groupValue: selectedSource,
                onChanged: (val) => setStateModal(() => selectedSource = val!),
              ),
              _buildPaymentOption(
                value: 'dana',
                title: 'DANA (Simulasi)',
                subtitle: 'Simulasi E-Wallet DANA',
                icon: Icons.account_balance,
                color: const Color(0xFF108EE9),
                groupValue: selectedSource,
                onChanged: (val) => setStateModal(() => selectedSource = val!),
              ),
              _buildPaymentOption(
                value: 'gopay',
                title: 'GoPay (Simulasi)',
                subtitle: 'Simulasi E-Wallet GoPay',
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
                        if (sel) setStateModal(() => simulatedStatus = 'success');
                      },
                    ),
                    const SizedBox(width: 8),
                    ChoiceChip(
                      label: const Text('Gagal'),
                      selected: simulatedStatus == 'failed',
                      onSelected: (sel) {
                        if (sel) setStateModal(() => simulatedStatus = 'failed');
                      },
                    ),
                  ],
                ),
              ],

              const SizedBox(height: 24),

              CustomButton(
                text: 'Lanjutkan Bayar',
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
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: groupValue == value ? color.withOpacity(0.08) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: groupValue == value ? color : const Color(0xFFE2E8F0),
          width: groupValue == value ? 1.5 : 1,
        ),
      ),
      child: RadioListTile<String>(
        value: value,
        groupValue: groupValue,
        onChanged: onChanged,
        activeColor: color,
        title: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
      ),
    );
  }

  void _processPay(
    PaymentRequestModel request,
    String source,
    String simulatedStatus,
  ) async {
    // Check balance if source == 'ipay'
    if (source == 'ipay') {
      final user = context.read<AuthProvider>().user;
      final walletBalance = context.read<WalletProvider>().balance;
      final balance = walletBalance > 0 ? walletBalance : (user?.balance ?? 0.0);

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

    // Prompt PIN
    final pin = await PinInputDialog.show(
      context,
      title: 'Konfirmasi Bayar Tagihan',
      description:
          'Masukkan PIN 6-digit untuk membayar ${CurrencyFormatter.formatRupiah(request.amount)} via ${source.toUpperCase()}',
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

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res['message'] ?? 'Pembayaran berhasil!'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(paymentProvider.errorMessage ?? 'Pembayaran gagal.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _handleReject(PaymentRequestModel request) async {
    final confirm = await ConfirmationDialog.show(
      context,
      title: 'Tolak Tagihan',
      message: 'Apakah Anda yakin ingin menolak tagihan dari ${request.requester?.name}?',
      confirmText: 'Tolak',
      isDanger: true,
    );

    if (confirm != true || !mounted) return;

    final success = await context.read<PaymentProvider>().rejectRequest(request.id);
    if (mounted && success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tagihan ditolak.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final paymentProvider = context.watch<PaymentProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tagihan Pembayaran'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'Perlu Dibayar'),
            Tab(text: 'Tagihan Dibuat'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Incoming requests
          RefreshIndicator(
            onRefresh: _loadRequests,
            child: paymentProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : paymentProvider.incomingRequests.isEmpty
                    ? const Center(
                        child: Text(
                          'Tidak ada tagihan masuk.',
                          style: TextStyle(color: AppColors.textMuted),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: paymentProvider.incomingRequests.length,
                        itemBuilder: (context, index) {
                          final req = paymentProvider.incomingRequests[index];
                          final isPending = req.status == 'pending';

                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        req.description ?? 'Tagihan Pembayaran',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                      StatusBadge(status: req.status),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    'Dari: ${req.requester?.name ?? '-'} (${req.requester?.ipayId ?? '-'})',
                                    style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 13,
                                    ),
                                  ),
                                  Text(
                                    DateFormatter.formatDateTime(req.createdAt),
                                    style: const TextStyle(
                                      color: AppColors.textMuted,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const Divider(height: 24),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        CurrencyFormatter.formatRupiah(
                                          req.amount,
                                        ),
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                      if (isPending)
                                        Row(
                                          children: [
                                            OutlinedButton(
                                              onPressed: () => _handleReject(req),
                                              style: OutlinedButton.styleFrom(
                                                foregroundColor: AppColors.error,
                                                side: const BorderSide(
                                                  color: AppColors.error,
                                                ),
                                              ),
                                              child: const Text('Tolak'),
                                            ),
                                            const SizedBox(width: 8),
                                            ElevatedButton(
                                              onPressed: () =>
                                                  _showPaymentModal(req),
                                              child: const Text('Bayar'),
                                            ),
                                          ],
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

          // Tab 2: Outgoing requests
          RefreshIndicator(
            onRefresh: _loadRequests,
            child: paymentProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : paymentProvider.outgoingRequests.isEmpty
                    ? const Center(
                        child: Text(
                          'Belum ada tagihan yang dibuat.',
                          style: TextStyle(color: AppColors.textMuted),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: paymentProvider.outgoingRequests.length,
                        itemBuilder: (context, index) {
                          final req = paymentProvider.outgoingRequests[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        req.description ?? 'Tagihan Pembayaran',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                      StatusBadge(status: req.status),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    'Kepada: ${req.payer?.name ?? '-'} (${req.payer?.ipayId ?? '-'})',
                                    style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 13,
                                    ),
                                  ),
                                  if (req.paymentCode != null) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      'Kode Bayar: ${req.paymentCode}',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  ],
                                  const Divider(height: 24),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        CurrencyFormatter.formatRupiah(
                                          req.amount,
                                        ),
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.textPrimary,
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
    );
  }
}
