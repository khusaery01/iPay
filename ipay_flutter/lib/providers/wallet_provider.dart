import 'package:flutter/material.dart';
import '../models/payment_method_model.dart';
import '../services/wallet_service.dart';

class WalletProvider extends ChangeNotifier {
  final WalletService _walletService = WalletService();

  double _balance = 0.0;
  bool _isBalanceVisible = true;
  bool _isLoading = false;
  String? _errorMessage;
  List<PaymentMethodModel> _paymentMethods = [];

  double get balance => _balance;
  bool get isBalanceVisible => _isBalanceVisible;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<PaymentMethodModel> get paymentMethods => _paymentMethods;

  void toggleBalanceVisibility() {
    _isBalanceVisible = !_isBalanceVisible;
    notifyListeners();
  }

  Future<void> fetchBalance() async {
    try {
      _balance = await _walletService.getBalance();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchPaymentMethods() async {
    try {
      _paymentMethods = await _walletService.getPaymentMethods();
      notifyListeners();
    } catch (_) {}
  }

  Future<Map<String, dynamic>?> topUp({
    required double amount,
    int? paymentMethodId,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _walletService.topUp(
        amount: amount,
        paymentMethodId: paymentMethodId,
      );
      _balance = res['new_balance'] as double;
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

  Future<bool> addPaymentMethod({
    required String type,
    required String provider,
    String? identifier,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _walletService.addPaymentMethod(
        type: type,
        provider: provider,
        identifier: identifier,
      );
      await fetchPaymentMethods();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> deletePaymentMethod(int id) async {
    try {
      await _walletService.deletePaymentMethod(id);
      await fetchPaymentMethods();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
