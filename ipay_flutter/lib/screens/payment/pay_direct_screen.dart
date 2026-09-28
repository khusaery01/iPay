import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/payment_provider.dart';
import '../../providers/wallet_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_input_dialog.dart';

class PayDirectScreen extends StatefulWidget {
  final String? initialCode;

  const PayDirectScreen({super.key, this.initialCode});

  @override
  State<PayDirectScreen> createState() => _PayDirectScreenState();
}

class _PayDirectScreenState extends State<PayDirectScreen> {
  final _formKey = GlobalKey<FormState>();
  final _paymentCodeController = TextEditingController();
  final _payerIpayIdController = TextEditingController();

  String _selectedSource = 'ipay';
  String _simulatedStatus = 'success';

  @override
  void initState() {
    super.initState();
    if (widget.initialCode != null) {
      _paymentCodeController.text = widget.initialCode!;
    }
  }

  @override
  void dispose() {
    _paymentCodeController.dispose();
    _payerIpayIdController.dispose();
    super.dispose();
  }

  void _handlePayDirect() async {
    if (!_formKey.currentState!.validate()) return;

    final paymentCode = _paymentCodeController.text.trim();
    final payerId = _payerIpayIdController.text.trim();

    // 1. PIN verification for Payer
    final pin = await PinInputDialog.show(
      context,
      title: 'Verifikasi PIN Pembeli',
      description:
          'Masukkan PIN 6-digit iPay Pembeli ($payerId) untuk menyetujui transaksi Pay Direct',
    );

    if (pin == null || pin.isEmpty || !mounted) return;

    final paymentProvider = context.read<PaymentProvider>();
    final res = await paymentProvider.payDirect(
      paymentCode: paymentCode,
      payerIpayId: payerId,
      pin: pin,
      source: _selectedSource,
      simulatedStatus: _simulatedStatus,
    );

    if (mounted) {
      if (res != null) {
        await context.read<WalletProvider>().fetchBalance();
        if (mounted) await context.read<AuthProvider>().refreshProfile();

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res['message'] ?? 'Pembayaran direct berhasil!'),
              backgroundColor: AppColors.success,
            ),
          );
          context.pop();
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              paymentProvider.errorMessage ?? 'Pembayaran direct gagal.',
            ),
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
        title: const Text('Pay Direct (Kode 6-Digit)'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Bayar Langsung via Kode Tagihan',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Masukkan 6-digit kode pembayaran dan iPay ID pembeli',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 24),

                // 6-digit Payment Code
                CustomTextField(
                  controller: _paymentCodeController,
                  label: 'Kode Pembayaran 6-Digit',
                  hint: 'Contoh: 123456',
                  prefixIcon: Icons.pin,
                  keyboardType: TextInputType.number,
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) {
                      return 'Kode pembayaran wajib diisi';
                    }
                    if (val.trim().length != 6) {
                      return 'Kode pembayaran harus 6 digit';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Payer iPay ID
                CustomTextField(
                  controller: _payerIpayIdController,
                  label: 'iPay ID Pembeli (Payer)',
                  hint: 'Contoh: IPY1234567',
                  prefixIcon: Icons.account_balance_wallet_outlined,
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) {
                      return 'iPay ID pembeli wajib diisi';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Payment Source Choice
                const Text(
                  'Sumber Dana Pembayaran:',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 10),

                _buildSourceTile('ipay', 'Saldo iPay Pembeli', Icons.account_balance_wallet, AppColors.primary),
                _buildSourceTile('dana', 'DANA (Simulasi)', Icons.account_balance, const Color(0xFF108EE9)),
                _buildSourceTile('gopay', 'GoPay (Simulasi)', Icons.mobile_friendly, const Color(0xFF00AED6)),
                _buildSourceTile('bca', 'BCA (Simulasi)', Icons.credit_card, const Color(0xFF005DAA)),

                if (_selectedSource != 'ipay') ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Text('Status Simulasi: '),
                      ChoiceChip(
                        label: const Text('Sukses'),
                        selected: _simulatedStatus == 'success',
                        onSelected: (sel) {
                          if (sel) setState(() => _simulatedStatus = 'success');
                        },
                      ),
                      const SizedBox(width: 8),
                      ChoiceChip(
                        label: const Text('Gagal'),
                        selected: _simulatedStatus == 'failed',
                        onSelected: (sel) {
                          if (sel) setState(() => _simulatedStatus = 'failed');
                        },
                      ),
                    ],
                  ),
                ],

                const SizedBox(height: 32),

                CustomButton(
                  text: 'Proses Pay Direct',
                  isLoading: paymentProvider.isLoading,
                  onPressed: _handlePayDirect,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSourceTile(String value, String label, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: _selectedSource == value ? color.withOpacity(0.08) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _selectedSource == value ? color : const Color(0xFFE2E8F0),
          width: _selectedSource == value ? 1.5 : 1,
        ),
      ),
      child: RadioListTile<String>(
        value: value,
        groupValue: _selectedSource,
        onChanged: (val) => setState(() => _selectedSource = val!),
        activeColor: color,
        title: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          ],
        ),
      ),
    );
  }
}
