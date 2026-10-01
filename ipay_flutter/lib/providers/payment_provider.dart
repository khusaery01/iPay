import 'package:flutter/material.dart';
import '../models/payment_request_model.dart';
import '../services/payment_service.dart';

class PaymentProvider extends ChangeNotifier {
  final PaymentService _paymentService = PaymentService();

  List<PaymentRequestModel> _incomingRequests = [];
  List<PaymentRequestModel> _outgoingRequests = [];
  bool _isLoadingIncoming = false;
  bool _isLoadingOutgoing = false;
  bool _isActionLoading = false;
  String? _incomingError;
  String? _outgoingError;
  String? _actionError;

  List<PaymentRequestModel> get incomingRequests => _incomingRequests;
  List<PaymentRequestModel> get outgoingRequests => _outgoingRequests;
  bool get isLoadingIncoming => _isLoadingIncoming;
  bool get isLoadingOutgoing => _isLoadingOutgoing;
  bool get isLoading => _isLoadingIncoming || _isLoadingOutgoing || _isActionLoading;
  bool get isActionLoading => _isActionLoading;
  String? get incomingError => _incomingError;
  String? get outgoingError => _outgoingError;
  String? get errorMessage => _actionError ?? _incomingError ?? _outgoingError;

  Future<void> fetchIncomingRequests({String? status}) async {
    _isLoadingIncoming = true;
    _incomingError = null;
    debugPrint('[PAY_BILLS] fetch start (incoming)');
    notifyListeners();

    try {
      _incomingRequests = await _paymentService.getIncomingRequests(status: status);
      _incomingError = null;
      debugPrint('[PAY_BILLS] fetch finish (incoming count: ${_incomingRequests.length})');
    } catch (e) {
      _incomingError = e.toString();
      debugPrint('[PAY_BILLS] fetch finish (error: $_incomingError)');
    } finally {
      _isLoadingIncoming = false;
      notifyListeners();
    }
  }

  Future<void> fetchOutgoingRequests({String? status}) async {
    _isLoadingOutgoing = true;
    _outgoingError = null;
    debugPrint('[PAY_BILLS] fetch start (outgoing)');
    notifyListeners();

    try {
      _outgoingRequests = await _paymentService.getOutgoingRequests(status: status);
      _outgoingError = null;
      debugPrint('[PAY_BILLS] fetch finish (outgoing count: ${_outgoingRequests.length})');
    } catch (e) {
      _outgoingError = e.toString();
      debugPrint('[PAY_BILLS] fetch finish (outgoing error: $_outgoingError)');
    } finally {
      _isLoadingOutgoing = false;
      notifyListeners();
    }
  }

  Future<void> loadAllRequests() async {
    await Future.wait([
      fetchIncomingRequests(),
      fetchOutgoingRequests(),
    ]);
  }

  Future<PaymentRequestModel?> getPaymentRequest(int id) async {
    try {
      return await _paymentService.getPaymentRequest(id);
    } catch (e) {
      _actionError = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<Map<String, dynamic>?> createRequest({
    required String toIpayId,
    required double amount,
    String? description,
    String? notes,
    int expiresIn = 24,
  }) async {
    _isActionLoading = true;
    _actionError = null;
    notifyListeners();

    try {
      final res = await _paymentService.createRequest(
        toIpayId: toIpayId,
        amount: amount,
        description: description,
        notes: notes,
        expiresIn: expiresIn,
      );
      _isActionLoading = false;
      notifyListeners();
      return res;
    } catch (e) {
      _actionError = e.toString();
      _isActionLoading = false;
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
    _isActionLoading = true;
    _actionError = null;
    notifyListeners();

    try {
      final res = await _paymentService.payRequest(
        id: id,
        pin: pin,
        source: source,
        simulatedStatus: simulatedStatus,
      );
      _isActionLoading = false;
      notifyListeners();
      return res;
    } catch (e) {
      _actionError = e.toString();
      _isActionLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<Map<String, dynamic>?> payDirect({
    required String payerIpayId,
    double? amount,
    String? description,
    String? paymentCode,
    required String pin,
    required String source,
    String simulatedStatus = 'success',
  }) async {
    _isActionLoading = true;
    _actionError = null;
    notifyListeners();

    try {
      final res = await _paymentService.payDirect(
        payerIpayId: payerIpayId,
        amount: amount,
        description: description,
        paymentCode: paymentCode,
        pin: pin,
        source: source,
        simulatedStatus: simulatedStatus,
      );
      _isActionLoading = false;
      notifyListeners();
      return res;
    } catch (e) {
      _actionError = e.toString();
      _isActionLoading = false;
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
      _actionError = e.toString();
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
      _actionError = e.toString();
      notifyListeners();
      return false;
    }
  }
}
