import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/currency_formatter.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/transaction_model.dart';
import '../../widgets/status_badge.dart';

class TransactionDetailScreen extends StatelessWidget {
  final TransactionModel transaction;

  const TransactionDetailScreen({super.key, required this.transaction});

  @override
  Widget build(BuildContext context) {
    final isIncome = transaction.direction == 'in' || transaction.type == 'topup';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Transaksi'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children: [
              // Receipt Container
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 15,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Status Badge & Icon
                    StatusBadge(status: transaction.status),
                    const SizedBox(height: 16),

                    Text(
                      isIncome ? 'Transaksi Masuk' : 'Transaksi Keluar',
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),

                    Text(
                      '${isIncome ? '+' : '-'} ${CurrencyFormatter.formatRupiah(transaction.amount)}',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: isIncome ? AppColors.success : AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 24),

                    const Divider(),
                    const SizedBox(height: 16),

                    _buildDetailRow(
                      'Kode Transaksi',
                      transaction.transactionCode,
                      isCopyable: true,
                      context: context,
                    ),
                    _buildDetailRow(
                      'Tipe Transaksi',
                      transaction.type.toUpperCase(),
                    ),
                    _buildDetailRow(
                      'Waktu Transaksi',
                      DateFormatter.formatDateTime(transaction.createdAt),
                    ),

                    if (transaction.sender != null)
                      _buildDetailRow(
                        'Pengirim',
                        '${transaction.sender!.name} (${transaction.sender!.ipayId})',
                      ),

                    if (transaction.receiver != null)
                      _buildDetailRow(
                        'Penerima',
                        '${transaction.receiver!.name} (${transaction.receiver!.ipayId})',
                      ),

                    if (transaction.description != null &&
                        transaction.description!.isNotEmpty)
                      _buildDetailRow('Deskripsi', transaction.description!),

                    if (transaction.otpCode != null &&
                        transaction.otpCode!.isNotEmpty)
                      _buildDetailRow(
                        'Kode Bayar (OTP)',
                        transaction.otpCode!,
                        isCopyable: true,
                        context: context,
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(
    String label,
    String value, {
    bool isCopyable = false,
    BuildContext? context,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
          Flexible(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  child: Text(
                    value,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.end,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (isCopyable && context != null) ...[
                  const SizedBox(width: 4),
                  InkWell(
                    onTap: () {
                      Clipboard.setData(ClipboardData(text: value));
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('$label disalin!')),
                      );
                    },
                    child: const Icon(
                      Icons.copy,
                      size: 14,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
