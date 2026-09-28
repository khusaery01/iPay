import 'package:intl/intl.dart';

class CurrencyFormatter {
  static String formatRupiah(num amount, {bool showSymbol = true}) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: showSymbol ? 'Rp' : '',
      decimalDigits: 0,
    );
    return formatter.format(amount).trim();
  }

  static String formatCompact(num amount) {
    if (amount >= 1000000000) {
      return 'Rp ${(amount / 1000000000).toStringAsFixed(1)} M';
    } else if (amount >= 1000000) {
      return 'Rp ${(amount / 1000000).toStringAsFixed(1)} Jt';
    } else if (amount >= 1000) {
      return 'Rp ${(amount / 1000).toStringAsFixed(0)} Rb';
    }
    return formatRupiah(amount);
  }
}
