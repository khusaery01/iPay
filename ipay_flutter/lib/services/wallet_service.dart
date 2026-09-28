import 'package:dio/dio.dart';
import '../core/network/api_client.dart';
import '../models/payment_method_model.dart';

class WalletService {
  final ApiClient _api = ApiClient();

  Future<double> getBalance() async {
    try {
      final response = await _api.get('/wallet');
      return double.tryParse(response.data['balance'].toString()) ?? 0.0;
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal mengambil saldo.';
    }
  }

  Future<List<PaymentMethodModel>> getPaymentMethods() async {
    try {
      final response = await _api.get('/wallet/methods');
      final list = (response.data['data'] as List)
          .map((item) => PaymentMethodModel.fromJson(item))
          .toList();
      return list;
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal mengambil metode pembayaran.';
    }
  }

  Future<PaymentMethodModel> addPaymentMethod({
    required String type,
    required String provider,
    String? identifier,
  }) async {
    try {
      final response = await _api.post('/wallet/methods', data: {
        'type': type,
        'provider': provider,
        'identifier': identifier,
      });
      return PaymentMethodModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal menambahkan metode pembayaran.';
    }
  }

  Future<void> deletePaymentMethod(int id) async {
    try {
      await _api.delete('/wallet/methods/$id');
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal menghapus metode pembayaran.';
    }
  }

  Future<Map<String, dynamic>> topUp({
    required double amount,
    int? paymentMethodId,
  }) async {
    try {
      final response = await _api.post('/wallet/topup', data: {
        'amount': amount,
        'payment_method_id': paymentMethodId,
      });

      return {
        'message': response.data['message'] ?? 'Top Up berhasil.',
        'transaction_code': response.data['transaction_code'],
        'amount': double.tryParse(response.data['amount'].toString()) ?? amount,
        'new_balance': double.tryParse(response.data['new_balance'].toString()) ?? 0.0,
      };
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Top Up gagal.';
    }
  }

  Future<List<Map<String, dynamic>>> getTopUpHistory() async {
    try {
      final response = await _api.get('/wallet/topup/history');
      final data = response.data['data'] as List;
      return List<Map<String, dynamic>>.from(data);
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal mengambil riwayat top up.';
    }
  }
}
