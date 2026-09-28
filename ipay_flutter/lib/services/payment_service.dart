import 'package:dio/dio.dart';
import '../core/network/api_client.dart';
import '../models/payment_request_model.dart';

class PaymentService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> createRequest({
    required String toIpayId,
    required double amount,
    String? description,
    String? notes,
    int expiresIn = 24,
  }) async {
    try {
      final response = await _api.post('/payments/request', data: {
        'to_ipay_id': toIpayId,
        'amount': amount,
        'description': description,
        'notes': notes,
        'expires_in': expiresIn,
      });

      return {
        'message': response.data['message'] ?? 'Payment request berhasil dibuat.',
        'payment_code': response.data['payment_code'],
        'data': PaymentRequestModel.fromJson(response.data['data']),
      };
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal membuat tagihan.';
    }
  }

  Future<List<PaymentRequestModel>> getIncomingRequests({String? status}) async {
    try {
      final query = <String, dynamic>{};
      if (status != null && status.isNotEmpty && status != 'all') {
        query['status'] = status;
      }
      final response = await _api.get('/payments/incoming', queryParameters: query);
      final rawList = response.data['data'] as List;
      return rawList.map((item) => PaymentRequestModel.fromJson(item)).toList();
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal mengambil tagihan masuk.';
    }
  }

  Future<List<PaymentRequestModel>> getOutgoingRequests({String? status}) async {
    try {
      final query = <String, dynamic>{};
      if (status != null && status.isNotEmpty && status != 'all') {
        query['status'] = status;
      }
      final response = await _api.get('/payments/outgoing', queryParameters: query);
      final rawList = response.data['data'] as List;
      return rawList.map((item) => PaymentRequestModel.fromJson(item)).toList();
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal mengambil tagihan keluar.';
    }
  }

  Future<PaymentRequestModel> getPaymentRequest(int id) async {
    try {
      final response = await _api.get('/payments/$id');
      return PaymentRequestModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal mengambil detail tagihan.';
    }
  }

  Future<Map<String, dynamic>> payRequest({
    required int id,
    required String pin,
    required String source, // ipay, dana, gopay, bca
    String simulatedStatus = 'success',
  }) async {
    try {
      final response = await _api.post('/payments/$id/pay', data: {
        'pin': pin,
        'source': source,
        'simulated_status': simulatedStatus,
      });

      return {
        'message': response.data['message'] ?? 'Pembayaran berhasil.',
        'transaction_code': response.data['transaction_code'],
        'amount': double.tryParse(response.data['amount'].toString()) ?? 0.0,
        'paid_to': response.data['paid_to'],
        'new_balance': response.data['new_balance'] != null
            ? double.tryParse(response.data['new_balance'].toString())
            : null,
      };
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Pembayaran gagal.';
    }
  }

  Future<Map<String, dynamic>> payDirect({
    required String paymentCode,
    required String payerIpayId,
    required String pin,
    required String source, // ipay, dana, gopay, bca
    String simulatedStatus = 'success',
  }) async {
    try {
      final response = await _api.post('/payments/pay-direct', data: {
        'payment_code': paymentCode,
        'payer_ipay_id': payerIpayId,
        'pin': pin,
        'source': source,
        'simulated_status': simulatedStatus,
      });

      return {
        'message': response.data['message'] ?? 'Pembayaran langsung berhasil.',
        'transaction_code': response.data['transaction_code'],
        'amount': double.tryParse(response.data['amount'].toString()) ?? 0.0,
        'paid_to': response.data['paid_to'],
        'new_balance': response.data['new_balance'] != null
            ? double.tryParse(response.data['new_balance'].toString())
            : null,
      };
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Pembayaran langsung gagal.';
    }
  }

  Future<void> rejectRequest(int id) async {
    try {
      await _api.post('/payments/$id/reject');
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal menolak tagihan.';
    }
  }

  Future<void> cancelRequest(int id) async {
    try {
      await _api.post('/payments/$id/cancel');
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal membatalkan tagihan.';
    }
  }
}
