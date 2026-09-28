import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import 'custom_button.dart';

class PinInputDialog extends StatefulWidget {
  final String title;
  final String description;
  final ValueChanged<String> onPinSubmitted;

  const PinInputDialog({
    super.key,
    this.title = 'Masukkan PIN',
    this.description = 'Masukkan 6-digit PIN iPay Anda untuk melanjutkan transaksi',
    required this.onPinSubmitted,
  });

  static Future<String?> show(
    BuildContext context, {
    String title = 'Masukkan PIN',
    String description = 'Masukkan 6-digit PIN iPay Anda untuk konfirmasi',
  }) {
    return showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: PinInputDialog(
          title: title,
          description: description,
          onPinSubmitted: (pin) => Navigator.pop(context, pin),
        ),
      ),
    );
  }

  @override
  State<PinInputDialog> createState() => _PinInputDialogState();
}

class _PinInputDialogState extends State<PinInputDialog> {
  final TextEditingController _pinController = TextEditingController();
  String _errorText = '';

  void _submit() {
    final pin = _pinController.text.trim();
    if (pin.length != 6 || int.tryParse(pin) == null) {
      setState(() {
        _errorText = 'PIN harus berupa 6 angka';
      });
      return;
    }
    widget.onPinSubmitted(pin);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
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
              Text(
                widget.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            widget.description,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 20),

          // PIN Input textfield
          TextField(
            controller: _pinController,
            keyboardType: TextInputType.number,
            maxLength: 6,
            obscureText: true,
            textAlign: TextAlign.center,
            autofocus: true,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              letterSpacing: 12,
            ),
            decoration: InputDecoration(
              counterText: '',
              hintText: '••••••',
              errorText: _errorText.isNotEmpty ? _errorText : null,
              contentPadding: const EdgeInsets.symmetric(vertical: 16),
            ),
            onChanged: (val) {
              if (_errorText.isNotEmpty) {
                setState(() => _errorText = '');
              }
              if (val.length == 6) {
                _submit();
              }
            },
          ),
          const SizedBox(height: 24),

          CustomButton(
            text: 'Konfirmasi PIN',
            onPressed: _submit,
          ),
        ],
      ),
    );
  }
}
