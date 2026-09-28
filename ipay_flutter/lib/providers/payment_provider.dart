import 'package:flutter/material.dart';
import '../models/payment_request_model.dart';
import '../services/payment_service.dart';

class PaymentProvider extends ChangeNotifier {
  final PaymentService _paymentService = PaymentService();

  List<PaymentRequestModel> _incomingRequests = [];
  List<PaymentRequestModel> _outgoingRequests = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<PaymentRequestModel> get incomingRequests => _incomingRequests;
  List<PaymentRequestModel> get outgoingRequests => _outgoingRequests;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchIncomingRequests({String? status}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _incomingRequests = await _paymentService.getIncomingRequests(status: status);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchOutgoingRequests({String? status}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _outgoingRequests = await _paymentService.getOutgoingRequests(status: status);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>?> createRequest({
    required String toIpayId,
    required double amount,
    String? description,
    String? notes,
    int expiresIn = 24,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _paymentService.createRequest(
        toIpayId: toIpayId,
        amount: amount,
        description: description,
        notes: notes,
        expiresIn: expiresIn,
      );
      _isLoading = false;
      notifyListeners();
      return res;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<Map<String, dynamic>?> payRequest({
    required int id,
    required String pin,
    required String source,
    String simulatedStatus = 'success',
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _paymentService.payRequest(
        id: id,
        pin: pin,
        source: source,
        simulatedStatus: simulatedStatus,
      );
      _isLoading = false;
      notifyListeners();
      return res;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<Map<String, dynamic>?> payDirect({
    required String paymentCode,
    required String payerIpayId,
    required String pin,
    required String source,
    String simulatedStatus = 'success',
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _paymentService.payDirect(
        paymentCode: paymentCode,
        payerIpayId: payerIpayId,
        pin: pin,
        source: source,
        simulatedStatus: simulatedStatus,
      );
      _isLoading = false;
      notifyListeners();
      return res;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<bool> rejectRequest(int id) async {
    try {
      await _paymentService.rejectRequest(id);
      await fetchIncomingRequests();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> cancelRequest(int id) async {
    try {
      await _paymentService.cancelRequest(id);
      await fetchOutgoingRequests();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
