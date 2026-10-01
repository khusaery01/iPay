import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../providers/wallet_provider.dart';
import '../../widgets/balance_card.dart';
import '../../widgets/quick_actions.dart';
import '../../widgets/transaction_item.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  Future<void> _loadData() async {
    final walletProvider = context.read<WalletProvider>();
    final transactionProvider = context.read<TransactionProvider>();
    final authProvider = context.read<AuthProvider>();

    await Future.wait([
      authProvider.refreshProfile(),
      walletProvider.fetchBalance(),
      transactionProvider.fetchTransactions(refresh: true),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final transactionProvider = context.watch<TransactionProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          color: AppColors.primary,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // User Header
                Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppColors.primaryLight.withOpacity(0.2),
                      child: Text(
                        user?.name.isNotEmpty == true
                            ? user!.name.substring(0, 1).toUpperCase()
                            : 'U',
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Selamat Datang,',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          Text(
                            user?.name ?? 'User iPay',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.qr_code, color: AppColors.primary),
                      onPressed: () => context.push('/my-qr'),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Balance Card
                BalanceCard(
                  onTopUpPressed: () => context.push('/topup'),
                  onTransferPressed: () => context.push('/transfer'),
                  onScanPressed: () => context.push('/scan-qr'),
                ),

                const SizedBox(height: 24),

                // Menu Layanan
                const Text(
                  'Layanan Utama',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),

                QuickActionsGrid(
                  items: [
                    QuickActionItem(
                      title: 'Transfer',
                      icon: Icons.send_rounded,
                      color: const Color(0xFF4F46E5),
                      onTap: () => context.push('/transfer'),
                    ),
                    QuickActionItem(
                      title: 'Top Up',
                      icon: Icons.add_circle,
                      color: const Color(0xFF10B981),
                      onTap: () => context.push('/topup'),
                    ),
                    QuickActionItem(
                      title: 'Bayar Tagihan',
                      icon: Icons.receipt_long,
                      color: const Color(0xFFF59E0B),
                      onTap: () => context.push('/pay-bills'),
                    ),
                    QuickActionItem(
                      title: 'Buat Tagihan',
                      icon: Icons.request_quote,
                      color: const Color(0xFF3B82F6),
                      onTap: () => context.push('/payment-request'),
                    ),
                    QuickActionItem(
                      title: 'Bayar Langsung',
                      icon: Icons.bolt,
                      color: const Color(0xFFEC4899),
                      onTap: () => context.push('/pay-direct'),
                    ),
                    QuickActionItem(
                      title: 'QR Saya',
                      icon: Icons.qr_code_2,
                      color: const Color(0xFF8B5CF6),
                      onTap: () => context.push('/my-qr'),
                    ),
                  ],
                ),

                const SizedBox(height: 28),

                // Recent Transactions Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Transaksi Terakhir',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    TextButton(
                      onPressed: () => context.go('/history'),
                      child: const Text(
                        'Lihat Semua',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Transaction list card
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: transactionProvider.isLoading
                      ? const Padding(
                          padding: EdgeInsets.all(32.0),
                          child: Center(
                            child: CircularProgressIndicator(),
                          ),
                        )
                      : transactionProvider.transactions.isEmpty
                          ? const Padding(
                              padding: EdgeInsets.all(32.0),
                              child: Center(
                                child: Text(
                                  'Belum ada riwayat transaksi.',
                                  style: TextStyle(
                                    color: AppColors.textMuted,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            )
                          : Column(
                              children: transactionProvider.transactions
                                  .take(5)
                                  .map(
                                    (txn) => TransactionItem(
                                      transaction: txn,
                                      onTap: () => context.push(
                                        '/history/detail',
                                        extra: txn,
                                      ),
                                    ),
                                  )
                                  .toList(),
                            ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
