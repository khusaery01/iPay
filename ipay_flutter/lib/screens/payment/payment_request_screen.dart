import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/payment_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class PaymentRequestScreen extends StatefulWidget {
  const PaymentRequestScreen({super.key});

  @override
  State<PaymentRequestScreen> createState() => _PaymentRequestScreenState();
}

class _PaymentRequestScreenState extends State<PaymentRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _toIpayIdController = TextEditingController();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _notesController = TextEditingController();

  String? _generatedPaymentCode;

  @override
  void dispose() {
    _toIpayIdController.dispose();
    _amountController.dispose();
    _descriptionController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _handleCreateRequest() async {
    if (!_formKey.currentState!.validate()) return;

    final currentUser = context.read<AuthProvider>().user;
    final targetId = _toIpayIdController.text.trim();

    if (currentUser?.ipayId == targetId) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tidak bisa membuat tagihan ke diri sendiri.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final amount = double.tryParse(_amountController.text.trim()) ?? 0.0;
    final paymentProvider = context.read<PaymentProvider>();

    final res = await paymentProvider.createRequest(
      toIpayId: targetId,
      amount: amount,
      description: _descriptionController.text.trim(),
      notes: _notesController.text.trim(),
    );

    if (mounted) {
      if (res != null) {
        setState(() {
          _generatedPaymentCode = res['payment_code'];
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(paymentProvider.errorMessage ?? 'Gagal membuat tagihan.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final paymentProvider = context.watch<PaymentProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Buat Tagihan / Request Pay'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: _generatedPaymentCode != null
              ? _buildSuccessView()
              : Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      CustomTextField(
                        controller: _toIpayIdController,
                        label: 'iPay ID Pembayar (Payer)',
                        hint: 'Contoh: IPY7654321',
                        prefixIcon: Icons.account_balance_wallet_outlined,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) {
                            return 'iPay ID wajib diisi';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      CustomTextField(
                        controller: _amountController,
                        label: 'Nominal Tagihan (Rp)',
                        hint: 'Minimal Rp1.000',
                        prefixIcon: Icons.attach_money,
                        keyboardType: TextInputType.number,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) {
                            return 'Nominal tagihan wajib diisi';
                          }
                          final amt = double.tryParse(val.trim());
                          if (amt == null || amt < 1000) {
                            return 'Nominal minimal Rp1.000';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      CustomTextField(
                        controller: _descriptionController,
                        label: 'Judul / Deskripsi Tagihan',
                        hint: 'Contoh: Bayar Kopi / Jasa Desain',
                        prefixIcon: Icons.description_outlined,
                      ),
                      const SizedBox(height: 16),
                      CustomTextField(
                        controller: _notesController,
                        label: 'Catatan Tambahan (Opsional)',
                        hint: 'Catatan khusus untuk pembayar',
                        prefixIcon: Icons.notes,
                        maxLines: 2,
                      ),
                      const SizedBox(height: 28),
                      CustomButton(
                        text: 'Buat Kode Tagihan',
                        isLoading: paymentProvider.isLoading,
                        onPressed: _handleCreateRequest,
                      ),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildSuccessView() {
    return Column(
      children: [
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.successBg,
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.check_circle,
            color: AppColors.success,
            size: 64,
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'Tagihan Berhasil Dibuat!',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Berikan Kode Pembayaran 6-Digit di bawah ke Pembayar untuk Pay Direct',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: AppColors.textSecondary,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 24),

        // Display 6-digit payment code in large box
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.primary, width: 2),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              const Text(
                'KODE PEMBAYARAN (SINGLE-USE)',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textMuted,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 8),
              SelectableText(
                _generatedPaymentCode!,
                style: const TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 8,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            OutlinedButton.icon(
              icon: const Icon(Icons.copy, size: 18),
              label: const Text('Salin Kode'),
              onPressed: () {
                Clipboard.setData(ClipboardData(text: _generatedPaymentCode!));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Kode pembayaran disalin!')),
                );
              },
            ),
          ],
        ),

        const SizedBox(height: 32),
        CustomButton(
          text: 'Kembali ke Beranda',
          onPressed: () => context.go('/home'),
        ),
      ],
    );
  }
}
