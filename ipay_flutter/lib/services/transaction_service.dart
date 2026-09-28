import 'package:dio/dio.dart';
import '../core/network/api_client.dart';
import '../models/transaction_model.dart';

class TransactionService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> getTransactions({
    String? type,
    String? status,
    int page = 1,
  }) async {
    try {
      final query = <String, dynamic>{'page': page};
      if (type != null && type.isNotEmpty && type != 'all') {
        query['type'] = type;
      }
      if (status != null && status.isNotEmpty && status != 'all') {
        query['status'] = status;
      }

      final response = await _api.get('/transactions', queryParameters: query);

      final rawList = response.data['data'] as List;
      final transactions = rawList.map((item) => TransactionModel.fromJson(item)).toList();

      return {
        'data': transactions,
        'current_page': response.data['current_page'] ?? 1,
        'last_page': response.data['last_page'] ?? 1,
        'total': response.data['total'] ?? transactions.length,
      };
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal mengambil riwayat transaksi.';
    }
  }

  Future<TransactionModel> getTransactionDetail(String code) async {
    try {
      final response = await _api.get('/transactions/$code');
      return TransactionModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal mengambil detail transaksi.';
    }
  }

  Future<TransactionUser> checkUser(String ipayId) async {
    try {
      final response = await _api.get('/transactions/check-user/$ipayId');
      return TransactionUser.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'iPay ID tidak ditemukan.';
    }
  }

  Future<Map<String, dynamic>> transfer({
    required String toIpayId,
    required double amount,
    String? description,
    required String pin,
  }) async {
    try {
      final response = await _api.post('/transactions/transfer', data: {
        'to_ipay_id': toIpayId,
        'amount': amount,
        'description': description,
        'pin': pin,
      });

      return {
        'message': response.data['message'] ?? 'Transfer berhasil.',
        'transaction_code': response.data['transaction_code'],
        'to': response.data['to'],
        'amount': double.tryParse(response.data['amount'].toString()) ?? amount,
        'new_balance': double.tryParse(response.data['new_balance'].toString()) ?? 0.0,
      };
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Transfer gagal.';
    }
  }
}
