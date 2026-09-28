import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/currency_formatter.dart';
import '../../providers/auth_provider.dart';
import '../../providers/wallet_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class TopUpScreen extends StatefulWidget {
  const TopUpScreen({super.key});

  @override
  State<TopUpScreen> createState() => _TopUpScreenState();
}

class _TopUpScreenState extends State<TopUpScreen> {
  final _amountController = TextEditingController();
  final List<double> _quickAmounts = [
    10000,
    20000,
    50000,
    100000,
    250000,
    500000,
  ];

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  void _selectQuickAmount(double amount) {
    _amountController.text = amount.toInt().toString();
  }

  void _handleTopUp() async {
    final amountText = _amountController.text.trim();
    final amount = double.tryParse(amountText);

    if (amount == null || amount < 10000) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Minimal Top Up adalah Rp10.000.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final walletProvider = context.read<WalletProvider>();
    final result = await walletProvider.topUp(amount: amount);

    if (mounted) {
      if (result != null) {
        await context.read<AuthProvider>().refreshProfile();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Top Up ${CurrencyFormatter.formatRupiah(amount)} Berhasil!',
              ),
              backgroundColor: AppColors.success,
            ),
          );
          context.pop();
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(walletProvider.errorMessage ?? 'Top Up gagal.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final walletProvider = context.watch<WalletProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Top Up Saldo'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Amount Input
              CustomTextField(
                controller: _amountController,
                label: 'Nominal Top Up (Rp)',
                hint: 'Minimal Rp10.000',
                prefixIcon: Icons.add_card,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 20),

              // Quick Nominal Options
              const Text(
                'Pilih Nominal Cepat',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),

              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: _quickAmounts.map((amount) {
                  return InkWell(
                    onTap: () => _selectQuickAmount(amount),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFCBD5E1)),
                      ),
                      child: Text(
                        CurrencyFormatter.formatRupiah(amount),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 36),

              // Submit Button
              CustomButton(
                text: 'Proses Top Up',
                isLoading: walletProvider.isLoading,
                onPressed: _handleTopUp,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
