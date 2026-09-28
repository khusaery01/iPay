import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/currency_formatter.dart';
import '../core/utils/date_formatter.dart';
import '../models/transaction_model.dart';
import 'status_badge.dart';

class TransactionItem extends StatelessWidget {
  final TransactionModel transaction;
  final VoidCallback? onTap;

  const TransactionItem({
    super.key,
    required this.transaction,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isIncome = transaction.direction == 'in' || transaction.type == 'topup';
    final amountColor = isIncome ? AppColors.success : AppColors.textPrimary;
    final sign = isIncome ? '+' : '-';

    IconData iconData;
    Color iconColor;
    String title;

    if (transaction.type == 'topup') {
      iconData = Icons.add_circle_outline;
      iconColor = AppColors.success;
      title = 'Top Up iPay';
    } else if (transaction.type == 'transfer') {
      if (isIncome) {
        iconData = Icons.arrow_downward;
        iconColor = AppColors.success;
        title = transaction.sender != null
            ? 'Dari ${transaction.sender!.name}'
            : 'Transfer Masuk';
      } else {
        iconData = Icons.arrow_upward;
        iconColor = AppColors.primary;
        title = transaction.receiver != null
            ? 'Ke ${transaction.receiver!.name}'
            : 'Transfer Keluar';
      }
    } else {
      // Payment
      iconData = Icons.payment;
      iconColor = AppColors.accent;
      title = transaction.description ?? 'Pembayaran';
    }

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            // Icon
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(iconData, color: iconColor, size: 20),
            ),
            const SizedBox(width: 14),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    DateFormatter.formatDateTime(transaction.createdAt),
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),

            // Amount & Status
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '$sign ${CurrencyFormatter.formatRupiah(transaction.amount)}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: amountColor,
                  ),
                ),
                const SizedBox(height: 4),
                StatusBadge(status: transaction.status),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
