import 'package:flutter_test/flutter_test.dart';
import 'package:ipay_flutter/core/utils/currency_formatter.dart';
import 'package:ipay_flutter/models/payment_request_model.dart';
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

  group('PaymentRequestModel Serialization Test', () {
    test('Parse incoming requests with null transaction and transaction_id', () {
      final jsonItem = {
        'id': 1,
        'requester_id': 2,
        'payer_id': 1,
        'amount': '75000.00',
        'description': 'Patungan kopi',
        'notes': 'Kemarin beli kopi bareng',
        'status': 'pending',
        'transaction_id': null,
        'expires_at': '2026-08-19T17:39:53.000000Z',
        'created_at': '2026-08-17T17:39:53.000000Z',
        'updated_at': '2026-08-17T17:39:53.000000Z',
        'requester': {
          'id': 2,
          'name': 'Budi Santoso',
          'ipay_id': 'IPY0000002',
          'phone': '082345678901'
        },
        'transaction': null
      };

      final req = PaymentRequestModel.fromJson(jsonItem);
      expect(req.id, 1);
      expect(req.amount, 75000.0);
      expect(req.requester?.name, 'Budi Santoso');
      expect(req.requester?.ipayId, 'IPY0000002');
      expect(req.status, 'pending');
      expect(req.transaction, isNull);
    });

    test('Parse request with transaction object', () {
      final jsonItem = {
        'id': 13,
        'requester_id': 3,
        'payer_id': 1,
        'amount': '15000.00',
        'description': 'Tagihan Kopi GoPay',
        'notes': null,
        'status': 'pending',
        'transaction_id': 21,
        'expires_at': '2026-08-18T18:44:17.000000Z',
        'created_at': '2026-08-17T18:44:17.000000Z',
        'updated_at': '2026-08-17T18:44:17.000000Z',
        'requester': {
          'id': 3,
          'name': 'Citra Dewi',
          'ipay_id': 'IPY0000003',
          'phone': '083456789012'
        },
        'transaction': {
          'id': 21,
          'transaction_code': 'TXN6813057240',
          'type': 'payment',
          'sender_id': 1,
          'receiver_id': 3,
          'amount': '15000.00',
          'payment_method_id': null,
          'description': 'Tagihan Kopi GoPay',
          'status': 'pending',
          'otp_code': '781962',
          'expires_at': '2026-08-18T18:44:17.000000Z',
          'completed_at': null,
          'created_at': '2026-08-17T18:44:17.000000Z',
          'updated_at': '2026-08-17T18:44:17.000000Z'
        }
      };

      final req = PaymentRequestModel.fromJson(jsonItem);
      expect(req.id, 13);
      expect(req.paymentCode, '781962');
      expect(req.transaction?.transactionCode, 'TXN6813057240');
    });
  });
}
