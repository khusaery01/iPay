import 'package:flutter_test/flutter_test.dart';
import 'package:ipay_flutter/core/utils/currency_formatter.dart';
import 'package:ipay_flutter/models/user_model.dart';

void main() {
  group('CurrencyFormatter Test', () {
    test('Format Rupiah correctly', () {
      final formatted = CurrencyFormatter.formatRupiah(50000);
      expect(formatted, contains('50.000'));
    });
  });

  group('UserModel Serialization Test', () {
    test('UserModel fromJson & toJson', () {
      final jsonMap = {
        'id': 1,
        'name': 'Test User',
        'email': 'test@ipay.id',
        'phone': '081234567890',
        'ipay_id': 'IPY1234567',
        'balance': 150000.0,
        'is_active': true,
      };

      final user = UserModel.fromJson(jsonMap);
      expect(user.name, 'Test User');
      expect(user.ipayId, 'IPY1234567');
      expect(user.balance, 150000.0);
    });
  });
}
