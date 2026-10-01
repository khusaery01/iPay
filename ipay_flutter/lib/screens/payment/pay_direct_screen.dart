import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/currency_formatter.dart';
import '../../providers/auth_provider.dart';
import '../../providers/payment_provider.dart';
import '../../providers/wallet_provider.dart';
import '../../services/transaction_service.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/pin_input_dialog.dart';

class PayDirectScreen extends StatefulWidget {
  final String? initialIpayId;

  const PayDirectScreen({super.key, this.initialIpayId});

  @override
  State<PayDirectScreen> createState() => _PayDirectScreenState();
}

class _PayDirectScreenState extends State<PayDirectScreen> {
  final _formKey = GlobalKey<FormState>();
  final _payerIpayIdController = TextEditingController();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _transactionService = TransactionService();

  String _selectedSource = 'ipay';
  String _simulatedStatus = 'success';
  String? _verifiedName;
  bool _isCheckingUser = false;
  String? _userCheckError;

  Map<String, dynamic>? _successResult;

  @override
  void initState() {
    super.initState();
    if (widget.initialIpayId != null && widget.initialIpayId!.isNotEmpty) {
      _payerIpayIdController.text = widget.initialIpayId!.toUpperCase();
      _checkUser(widget.initialIpayId!);
    }
  }

  @override
  void dispose() {
    _payerIpayIdController.dispose();
    _amountController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _checkUser(String ipayId) async {
    final trimmedId = ipayId.trim().toUpperCase();
    if (trimmedId.isEmpty) return;

    setState(() {
      _isCheckingUser = true;
      _userCheckError = null;
      _verifiedName = null;
    });

    try {
      final user = await _transactionService.checkUser(trimmedId);
      if (mounted) {
        setState(() {
          _verifiedName = user.name;
          _userCheckError = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _userCheckError = e.toString();
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isCheckingUser = false;
        });
      }
    }
  }

  void _handlePayDirect() async {
    if (!_formKey.currentState!.validate()) return;

    final payerId = _payerIpayIdController.text.trim().toUpperCase();
    final rawAmount = _amountController.text.replaceAll(RegExp(r'[^0-9]'), '');
    final amount = double.tryParse(rawAmount) ?? 0.0;
    final description = _descriptionController.text.trim();

    if (amount < 1000) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Nominal pembayaran minimal Rp 1.000'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    // Input PIN Pembeli secara privat
    final pin = await PinInputDialog.show(
      context,
      title: 'Otorisasi PIN Pembeli',
      description:
          'Berikan perangkat kepada pembeli (${_verifiedName ?? payerId}) untuk memasukkan 6-digit PIN keamanan iPay',
    );

    if (pin == null || pin.isEmpty || !mounted) return;

    final paymentProvider = context.read<PaymentProvider>();
    final res = await paymentProvider.payDirect(
      payerIpayId: payerId,
      amount: amount,
      description: description.isNotEmpty ? description : null,
      pin: pin,
      source: _selectedSource,
      simulatedStatus: _simulatedStatus,
    );

    if (mounted) {
      if (res != null) {
        await context.read<WalletProvider>().fetchBalance();
        if (mounted) await context.read<AuthProvider>().refreshProfile();

        setState(() {
          _successResult = res;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              paymentProvider.errorMessage ?? 'Pembayaran langsung gagal.',
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

    if (_successResult != null) {
      return _buildSuccessView();
    }

    return PopScope(
      canPop: true,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Bayar Langsung'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            tooltip: 'Kembali',
            onPressed: () {
              if (Navigator.of(context).canPop()) {
                Navigator.of(context).pop();
              } else {
                context.go('/home');
              }
            },
          ),
        ),
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Info Banner
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.primary.withValues(alpha: 0.2),
                    ),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.bolt, color: AppColors.primary, size: 24),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Terima pembayaran langsung di HP penjual. Masukkan iPay ID pembeli & nominal, lalu pembeli mengotorisasi dengan PIN.',
                          style: TextStyle(
                            fontSize: 12.5,
                            color: AppColors.primary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // iPay ID Pembeli Input
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: CustomTextField(
                        controller: _payerIpayIdController,
                        label: 'iPay ID Pembeli (Payer)',
                        hint: 'Contoh: IPY0000002',
                        prefixIcon: Icons.account_balance_wallet_outlined,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) {
                            return 'iPay ID pembeli wajib diisi';
                          }
                          return null;
                        },
                        onChanged: (val) {
                          if (_verifiedName != null || _userCheckError != null) {
                            setState(() {
                              _verifiedName = null;
                              _userCheckError = null;
                            });
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Padding(
                      padding: const EdgeInsets.only(top: 24.0),
                      child: SizedBox(
                        height: 52,
                        child: ElevatedButton(
                          onPressed: _isCheckingUser
                              ? null
                              : () => _checkUser(_payerIpayIdController.text),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: _isCheckingUser
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text('Cek ID'),
                        ),
                      ),
                    ),
                  ],
                ),

                // Verified User Feedback
                if (_verifiedName != null) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.success.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.check_circle,
                          color: AppColors.success,
                          size: 16,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Pembeli: $_verifiedName',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: AppColors.success,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                if (_userCheckError != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    _userCheckError!,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.error,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],

                // Quick Demo Shortcuts
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      const Text(
                        'Demo ID: ',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textMuted,
                        ),
                      ),
                      _buildQuickUserChip('Budi', 'IPY0000002'),
                      const SizedBox(width: 6),
                      _buildQuickUserChip('Citra', 'IPY0000003'),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Nominal Input
                CustomTextField(
                  controller: _amountController,
                  label: 'Nominal Pembayaran (Rp)',
                  hint: 'Min. 1.000 (Contoh: 50000)',
                  prefixIcon: Icons.payments_outlined,
                  keyboardType: TextInputType.number,
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) {
                      return 'Nominal pembayaran wajib diisi';
                    }
                    final num = double.tryParse(
                      val.replaceAll(RegExp(r'[^0-9]'), ''),
                    );
                    if (num == null || num < 1000) {
                      return 'Nominal minimal Rp 1.000';
                    }
                    return null;
                  },
                ),

                // Nominal Preset Chips
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  children: [10000, 25000, 50000, 100000].map((amt) {
                    return ActionChip(
                      label: Text(
                        CurrencyFormatter.formatRupiah(amt.toDouble()),
                        style: const TextStyle(fontSize: 11),
                      ),
                      onPressed: () {
                        _amountController.text = amt.toString();
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),

                // Description (Optional)
                CustomTextField(
                  controller: _descriptionController,
                  label: 'Keterangan / Nama Barang (Opsional)',
                  hint: 'Contoh: Pembelian kopi / makanan',
                  prefixIcon: Icons.edit_note,
                ),
                const SizedBox(height: 20),

                // Sumber Dana
                const Text(
                  'Pilih Sumber Dana Pembayaran:',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 10),

                _buildSourceTile(
                  'ipay',
                  'Saldo iPay Pembeli',
                  Icons.account_balance_wallet,
                  AppColors.primary,
                ),
                _buildSourceTile(
                  'dana',
                  'DANA (Simulasi)',
                  Icons.account_balance,
                  const Color(0xFF108EE9),
                ),
                _buildSourceTile(
                  'gopay',
                  'GoPay (Simulasi)',
                  Icons.mobile_friendly,
                  const Color(0xFF00AED6),
                ),
                _buildSourceTile(
                  'bca',
                  'BCA (Simulasi)',
                  Icons.credit_card,
                  const Color(0xFF005DAA),
                ),

                if (_selectedSource != 'ipay') ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Text(
                        'Status Simulasi: ',
                        style: TextStyle(fontSize: 13),
                      ),
                      ChoiceChip(
                        label: const Text('Sukses'),
                        selected: _simulatedStatus == 'success',
                        selectedColor: AppColors.success.withValues(alpha: 0.2),
                        onSelected: (sel) {
                          if (sel) setState(() => _simulatedStatus = 'success');
                        },
                      ),
                      const SizedBox(width: 8),
                      ChoiceChip(
                        label: const Text('Gagal'),
                        selected: _simulatedStatus == 'failed',
                        selectedColor: AppColors.error.withValues(alpha: 0.2),
                        onSelected: (sel) {
                          if (sel) setState(() => _simulatedStatus = 'failed');
                        },
                      ),
                    ],
                  ),
                ],

                const SizedBox(height: 28),

                CustomButton(
                  text: 'Otorisasi & Bayar Langsung',
                  isLoading: paymentProvider.isLoading,
                  onPressed: _handlePayDirect,
                ),
              ],
            ),
          ),
        ),
      ),
    ),
    );
  }

  Widget _buildQuickUserChip(String name, String id) {
    return InkWell(
      onTap: () {
        _payerIpayIdController.text = id;
        _checkUser(id);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          '$name ($id)',
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
      ),
    );
  }

  Widget _buildSourceTile(
    String value,
    String label,
    IconData icon,
    Color color,
  ) {
    final isSelected = _selectedSource == value;
    return InkWell(
      onTap: () => setState(() => _selectedSource = value),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
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
              child: Text(
                label,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
            Radio<String>(
              value: value,
              groupValue: _selectedSource,
              onChanged: (val) => setState(() => _selectedSource = val!),
              activeColor: color,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSuccessView() {
    final res = _successResult!;
    final amount = double.tryParse(res['amount'].toString()) ?? 0.0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bukti Pembayaran Langsung'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              const Spacer(),
              Container(
                width: 72,
                height: 72,
                decoration: const BoxDecoration(
                  color: AppColors.successBg,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  color: AppColors.success,
                  size: 48,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Pembayaran Langsung Berhasil!',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                res['message'] ?? 'Transaksi Pay Direct sukses diproses.',
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // Detail Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    _buildDetailRow(
                      'Kode Transaksi',
                      res['transaction_code'] ?? '-',
                    ),
                    const Divider(height: 16),
                    _buildDetailRow(
                      'Penerima (Penjual)',
                      res['paid_to'] ?? '-',
                    ),
                    const Divider(height: 16),
                    _buildDetailRow(
                      'Pembeli',
                      _verifiedName ?? _payerIpayIdController.text,
                    ),
                    const Divider(height: 16),
                    _buildDetailRow(
                      'Sumber Dana',
                      _selectedSource.toUpperCase(),
                      valueColor: AppColors.primary,
                    ),
                    const Divider(height: 16),
                    _buildDetailRow(
                      'Total Nominal',
                      CurrencyFormatter.formatRupiah(amount),
                      isBold: true,
                      valueColor: AppColors.success,
                    ),
                  ],
                ),
              ),

              const Spacer(),
              CustomButton(
                text: 'Selesai & Kembali',
                onPressed: () => context.pop(),
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
    bool isBold = false,
    Color? valueColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        Text(
          value,
          style: TextStyle(
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            fontSize: isBold ? 15 : 13,
            color: valueColor ?? AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
