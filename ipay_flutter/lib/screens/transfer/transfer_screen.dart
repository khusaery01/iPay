import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/transaction_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../providers/wallet_provider.dart';
import '../../widgets/confirmation_dialog.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_input_dialog.dart';

class TransferScreen extends StatefulWidget {
  final String? initialIpayId;

  const TransferScreen({super.key, this.initialIpayId});

  @override
  State<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen> {
  final _formKey = GlobalKey<FormState>();
  final _ipayIdController = TextEditingController();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();

  TransactionUser? _checkedRecipient;
  bool _isCheckingUser = false;
  String? _userCheckError;

  @override
  void initState() {
    super.initState();
    if (widget.initialIpayId != null && widget.initialIpayId!.isNotEmpty) {
      _ipayIdController.text = widget.initialIpayId!;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _checkUser(widget.initialIpayId!);
      });
    }
  }

  @override
  void dispose() {
    _ipayIdController.dispose();
    _amountController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _checkUser(String ipayId) async {
    final cleanId = ipayId.trim();
    if (cleanId.isEmpty) return;

    final currentUser = context.read<AuthProvider>().user;
    if (currentUser?.ipayId == cleanId) {
      setState(() {
        _checkedRecipient = null;
        _userCheckError = 'Tidak bisa transfer ke akun sendiri.';
      });
      return;
    }

    setState(() {
      _isCheckingUser = true;
      _userCheckError = null;
      _checkedRecipient = null;
    });

    final recipient = await context.read<TransactionProvider>().checkUser(cleanId);

    if (mounted) {
      setState(() {
        _isCheckingUser = false;
        if (recipient != null) {
          _checkedRecipient = recipient;
          _userCheckError = null;
        } else {
          _userCheckError = 'iPay ID penerima tidak ditemukan.';
        }
      });
    }
  }

  void _handleTransfer() async {
    if (!_formKey.currentState!.validate()) return;

    final authUser = context.read<AuthProvider>().user;
    final walletProvider = context.read<WalletProvider>();
    final currentBalance = walletProvider.balance > 0
        ? walletProvider.balance
        : (authUser?.balance ?? 0.0);

    final targetId = _ipayIdController.text.trim();
    final amount = double.tryParse(_amountController.text.trim()) ?? 0.0;
    final description = _descriptionController.text.trim();

    // 1. Validation: Self transfer
    if (authUser?.ipayId == targetId) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tidak bisa transfer ke akun sendiri.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    // 2. Validation: Min Amount
    if (amount < 1000) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Minimal transfer adalah Rp1.000.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    // 3. Validation: Insufficient Balance
    if (amount > currentBalance) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Saldo tidak cukup! Saldo Anda ${CurrencyFormatter.formatRupiah(currentBalance)}',
          ),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    // 4. Confirm Recipient if not checked yet
    if (_checkedRecipient == null) {
      await _checkUser(targetId);
      if (!mounted || _checkedRecipient == null) {
        return;
      }
    }

    // 5. Confirmation Dialog
    final confirmed = await ConfirmationDialog.show(
      context,
      title: 'Konfirmasi Transfer',
      message:
          'Transfer sebesar ${CurrencyFormatter.formatRupiah(amount)} ke ${_checkedRecipient!.name} (${_checkedRecipient!.ipayId})?',
      confirmText: 'Lanjutkan',
    );

    if (confirmed != true || !mounted) return;

    // 6. Enter PIN
    final pin = await PinInputDialog.show(
      context,
      title: 'Verifikasi PIN',
      description:
          'Masukkan PIN 6-digit iPay Anda untuk menyetujui transfer ${CurrencyFormatter.formatRupiah(amount)}',
    );

    if (pin == null || pin.isEmpty || !mounted) return;

    // 7. Execute Transfer
    final transactionProvider = context.read<TransactionProvider>();
    final result = await transactionProvider.transfer(
      toIpayId: targetId,
      amount: amount,
      description: description.isEmpty ? 'Transfer' : description,
      pin: pin,
    );

    if (mounted) {
      if (result != null) {
        // Refresh balance & profile
        await context.read<WalletProvider>().fetchBalance();
        if (mounted) await context.read<AuthProvider>().refreshProfile();

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result['message'] ?? 'Transfer berhasil!'),
              backgroundColor: AppColors.success,
            ),
          );
          context.pop();
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(transactionProvider.errorMessage ?? 'Transfer gagal.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final transactionProvider = context.watch<TransactionProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transfer iPay'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // iPay ID Input & Check Button
                CustomTextField(
                  controller: _ipayIdController,
                  label: 'iPay ID Tujuan',
                  hint: 'Contoh: IPY1234567',
                  prefixIcon: Icons.account_balance_wallet_outlined,
                  suffixIcon: _isCheckingUser
                      ? const Padding(
                          padding: EdgeInsets.all(12.0),
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : TextButton(
                          onPressed: () => _checkUser(_ipayIdController.text),
                          child: const Text('Cek ID'),
                        ),
                  onChanged: (val) {
                    if (_checkedRecipient != null || _userCheckError != null) {
                      setState(() {
                        _checkedRecipient = null;
                        _userCheckError = null;
                      });
                    }
                  },
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) {
                      return 'iPay ID tujuan wajib diisi';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 8),

                // User Check Status Card
                if (_checkedRecipient != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.successBg,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle, color: AppColors.success),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _checkedRecipient!.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF065F46),
                                ),
                              ),
                              Text(
                                'iPay ID: ${_checkedRecipient!.ipayId}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF047857),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                if (_userCheckError != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.errorBg,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: AppColors.error),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _userCheckError!,
                            style: const TextStyle(
                              color: AppColors.error,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 20),

                // Amount Input
                CustomTextField(
                  controller: _amountController,
                  label: 'Nominal Transfer (Rp)',
                  hint: 'Minimal Rp1.000',
                  prefixIcon: Icons.attach_money,
                  keyboardType: TextInputType.number,
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) {
                      return 'Nominal transfer wajib diisi';
                    }
                    final amt = double.tryParse(val.trim());
                    if (amt == null || amt < 1000) {
                      return 'Nominal minimal Rp1.000';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Description
                CustomTextField(
                  controller: _descriptionController,
                  label: 'Catatan / Deskripsi (Opsional)',
                  hint: 'Contoh: Bayar makan malam',
                  prefixIcon: Icons.note_alt_outlined,
                ),
                const SizedBox(height: 32),

                // Submit Button
                CustomButton(
                  text: 'Lanjutkan Transfer',
                  isLoading: transactionProvider.isLoading,
                  onPressed: _handleTransfer,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
