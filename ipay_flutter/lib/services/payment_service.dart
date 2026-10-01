import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
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
      debugPrint('[PAYMENT_SERVICE] POST /payments/request');
      final response = await _api.post('/payments/request', data: {
        'to_ipay_id': toIpayId,
        'amount': amount,
        'description': description,
        'notes': notes,
        'expires_in': expiresIn,
      });
      debugPrint('[PAYMENT_SERVICE] Status: ${response.statusCode}');

      return {
        'message': response.data['message'] ?? 'Payment request berhasil dibuat.',
        'payment_code': response.data['payment_code'],
        'data': PaymentRequestModel.fromJson(response.data['data']),
      };
    } on DioException catch (e) {
      debugPrint('[PAYMENT_SERVICE] Error POST /payments/request: ${e.message}');
      throw e.error?.toString() ?? 'Gagal membuat tagihan.';
    }
  }

  Future<List<PaymentRequestModel>> getIncomingRequests({String? status}) async {
    try {
      final query = <String, dynamic>{};
      if (status != null && status.isNotEmpty && status != 'all') {
        query['status'] = status;
      }
      debugPrint('[PAY_BILLS] fetchIncomingRequests START');
      debugPrint('[PAY_BILLS] URL request: ${_api.dio.options.baseUrl}/payments/incoming (query: $query)');
      final response = await _api.get('/payments/incoming', queryParameters: query);
      debugPrint('[PAY_BILLS] HTTP status: ${response.statusCode}');
      debugPrint('[PAY_BILLS] response body: ${response.data}');

      dynamic listData;
      if (response.data is Map && response.data['data'] != null) {
        listData = response.data['data'];
      } else if (response.data is List) {
        listData = response.data;
      } else {
        listData = [];
      }

      final rawList = listData as List;
      debugPrint('[PAY_BILLS] jumlah item response: ${rawList.length}');
      final parsed = <PaymentRequestModel>[];
      for (int i = 0; i < rawList.length; i++) {
        try {
          final item = PaymentRequestModel.fromJson(Map<String, dynamic>.from(rawList[i] as Map));
          parsed.add(item);
        } catch (itemErr, stack) {
          debugPrint('[PAY_BILLS] Gagal parsing item index $i: $itemErr\n$stack');
        }
      }

      debugPrint('[PAY_BILLS] jumlah item berhasil diparse: ${parsed.length}');
      return parsed;
    } on DioException catch (e) {
      debugPrint('[PAY_BILLS] error/exception lengkap (DioException): status=${e.response?.statusCode} message=${e.message} error=${e.error} data=${e.response?.data}');
      throw e.error?.toString() ?? 'Gagal mengambil tagihan masuk.';
    } catch (e, stack) {
      debugPrint('[PAY_BILLS] error/exception lengkap (General): $e\n$stack');
      throw 'Format data tagihan tidak valid: $e';
    }
  }

  Future<List<PaymentRequestModel>> getOutgoingRequests({String? status}) async {
    try {
      final query = <String, dynamic>{};
      if (status != null && status.isNotEmpty && status != 'all') {
        query['status'] = status;
      }
      debugPrint('[PAYMENT_SERVICE] GET /payments/outgoing (query: $query)');
      final response = await _api.get('/payments/outgoing', queryParameters: query);
      debugPrint('[PAYMENT_SERVICE] Status: ${response.statusCode}');

      dynamic listData;
      if (response.data is Map && response.data['data'] != null) {
        listData = response.data['data'];
      } else if (response.data is List) {
        listData = response.data;
      } else {
        listData = [];
      }

      final rawList = listData as List;
      final parsed = rawList
          .map((item) => PaymentRequestModel.fromJson(
              Map<String, dynamic>.from(item as Map)))
          .toList();

      debugPrint('[PAYMENT_SERVICE] Parsed ${parsed.length} outgoing requests.');
      return parsed;
    } on DioException catch (e) {
      debugPrint('[PAYMENT_SERVICE] Error GET /payments/outgoing: ${e.message}');
      throw e.error?.toString() ?? 'Gagal mengambil tagihan keluar.';
    } catch (e, stack) {
      debugPrint('[PAYMENT_SERVICE] Parsing error GET /payments/outgoing: $e\n$stack');
      throw 'Format data tagihan tidak valid: $e';
    }
  }

  Future<PaymentRequestModel> getPaymentRequest(int id) async {
    try {
      debugPrint('[PAYMENT_SERVICE] GET /payments/$id');
      final response = await _api.get('/payments/$id');
      debugPrint('[PAYMENT_SERVICE] Status: ${response.statusCode}');

      final data = response.data is Map && response.data['data'] != null
          ? response.data['data']
          : response.data;

      return PaymentRequestModel.fromJson(Map<String, dynamic>.from(data as Map));
    } on DioException catch (e) {
      debugPrint('[PAYMENT_SERVICE] Error GET /payments/$id: ${e.message}');
      throw e.error?.toString() ?? 'Gagal mengambil detail tagihan.';
    } catch (e) {
      throw 'Format detail tagihan tidak valid: $e';
    }
  }

  Future<Map<String, dynamic>> payRequest({
    required int id,
    required String pin,
    required String source, // ipay, dana, gopay, bca
    String simulatedStatus = 'success',
  }) async {
    try {
      debugPrint('[PAYMENT_SERVICE] POST /payments/$id/pay (source: $source)');
      final response = await _api.post('/payments/$id/pay', data: {
        'pin': pin,
        'source': source,
        'simulated_status': simulatedStatus,
      });
      debugPrint('[PAYMENT_SERVICE] Status: ${response.statusCode}');

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
      debugPrint('[PAYMENT_SERVICE] Error POST /payments/$id/pay: ${e.message}');
      throw e.error?.toString() ?? 'Pembayaran gagal.';
    }
  }

  Future<Map<String, dynamic>> payDirect({
    required String payerIpayId,
    double? amount,
    String? description,
    String? paymentCode,
    required String pin,
    required String source, // ipay, dana, gopay, bca
    String simulatedStatus = 'success',
  }) async {
    try {
      final payload = <String, dynamic>{
        'payer_ipay_id': payerIpayId,
        'pin': pin,
        'source': source,
        'simulated_status': simulatedStatus,
      };
      if (amount != null) {
        payload['amount'] = amount;
      }
      if (description != null && description.isNotEmpty) {
        payload['description'] = description;
      }
      if (paymentCode != null && paymentCode.isNotEmpty) {
        payload['payment_code'] = paymentCode;
      }

      debugPrint('[PAYMENT_SERVICE] POST /payments/pay-direct (payer: $payerIpayId)');
      final response = await _api.post('/payments/pay-direct', data: payload);
      debugPrint('[PAYMENT_SERVICE] Status: ${response.statusCode}');

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
      debugPrint('[PAYMENT_SERVICE] Error POST /payments/pay-direct: ${e.message}');
      throw e.error?.toString() ?? 'Pembayaran langsung gagal.';
    }
  }

  Future<void> rejectRequest(int id) async {
    try {
      debugPrint('[PAYMENT_SERVICE] POST /payments/$id/reject');
      await _api.post('/payments/$id/reject');
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal menolak tagihan.';
    }
  }

  Future<void> cancelRequest(int id) async {
    try {
      debugPrint('[PAYMENT_SERVICE] POST /payments/$id/cancel');
      await _api.post('/payments/$id/cancel');
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal membatalkan tagihan.';
    }
  }
}
