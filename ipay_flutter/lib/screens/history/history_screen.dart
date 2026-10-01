import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/transaction_provider.dart';
import '../../widgets/transaction_item.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  String _selectedType = 'all';
  final String _selectedStatus = 'all';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _fetchHistory(refresh: false);
      }
    });
  }

  Future<void> _fetchHistory({bool refresh = false}) async {
    if (!mounted) return;
    await context.read<TransactionProvider>().fetchTransactions(
          type: _selectedType,
          status: _selectedStatus,
          refresh: refresh,
        );
  }

  void _onFilterChanged(String newType) {
    if (_selectedType == newType) return;
    setState(() {
      _selectedType = newType;
    });
    _fetchHistory(refresh: true);
  }

  @override
  Widget build(BuildContext context) {
    final transactionProvider = context.watch<TransactionProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Transaksi'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Filter Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: AppColors.surface,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    const Icon(Icons.filter_list, size: 20, color: AppColors.textSecondary),
                    const SizedBox(width: 8),
                    _buildFilterChip('Semua Jenis', 'all', _selectedType, _onFilterChanged),
                    const SizedBox(width: 6),
                    _buildFilterChip('Transfer', 'transfer', _selectedType, _onFilterChanged),
                    const SizedBox(width: 6),
                    _buildFilterChip('Top Up', 'topup', _selectedType, _onFilterChanged),
                    const SizedBox(width: 6),
                    _buildFilterChip('Pembayaran', 'payment', _selectedType, _onFilterChanged),
                  ],
                ),
              ),
            ),
            const Divider(height: 1),

            // Transactions List
            Expanded(
              child: RefreshIndicator(
                onRefresh: () => _fetchHistory(refresh: true),
                child: transactionProvider.isLoading && transactionProvider.transactions.isEmpty
                    ? const Center(child: CircularProgressIndicator())
                    : transactionProvider.errorMessage != null && transactionProvider.transactions.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24.0),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.error_outline, size: 48, color: AppColors.error),
                                  const SizedBox(height: 12),
                                  Text(
                                    transactionProvider.errorMessage!,
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(color: AppColors.textSecondary),
                                  ),
                                  const SizedBox(height: 16),
                                  ElevatedButton(
                                    onPressed: () => _fetchHistory(refresh: true),
                                    child: const Text('Coba Lagi'),
                                  ),
                                ],
                              ),
                            ),
                          )
                        : transactionProvider.transactions.isEmpty
                            ? const Center(
                                child: Text(
                                  'Belum ada transaksi ditemukan.',
                                  style: TextStyle(color: AppColors.textMuted),
                                ),
                              )
                            : ListView.separated(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                itemCount: transactionProvider.transactions.length,
                                separatorBuilder: (context, index) =>
                                    const Divider(height: 1, indent: 64),
                                itemBuilder: (context, index) {
                                  final txn = transactionProvider.transactions[index];
                                  return TransactionItem(
                                    transaction: txn,
                                    onTap: () => context.push(
                                      '/history/detail',
                                      extra: txn,
                                    ),
                                  );
                                },
                              ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(
    String label,
    String value,
    String currentValue,
    ValueChanged<String> onSelected,
  ) {
    final isSelected = value == currentValue;
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
        if (selected) onSelected(value);
      },
    );
  }
}
