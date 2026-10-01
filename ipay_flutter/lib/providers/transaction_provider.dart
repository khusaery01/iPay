import 'package:flutter/material.dart';
import '../models/transaction_model.dart';
import '../services/transaction_service.dart';

class TransactionProvider extends ChangeNotifier {
  final TransactionService _transactionService = TransactionService();

  List<TransactionModel> _transactions = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _selectedType = 'all';
  String _selectedStatus = 'all';
  int _currentPage = 1;
  int _lastPage = 1;
  bool _hasInitialLoaded = false;

  List<TransactionModel> get transactions => _transactions;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get selectedType => _selectedType;
  String get selectedStatus => _selectedStatus;
  int get currentPage => _currentPage;
  int get lastPage => _lastPage;
  bool get hasInitialLoaded => _hasInitialLoaded;

  Future<void> fetchTransactions({
    String? type,
    String? status,
    bool refresh = false,
  }) async {
    // Guard 1: Cegah multiple/concurrent fetch berulang saat request masih berlangsung
    if (_isLoading) return;

    final newType = type ?? _selectedType;
    final newStatus = status ?? _selectedStatus;
    final bool filterChanged = (newType != _selectedType || newStatus != _selectedStatus);

    // Guard 2: Jika data sudah pernah dimuat dan filter tidak berubah serta bukan pull-to-refresh, jangan fetch ulang
    if (!refresh && !filterChanged && _hasInitialLoaded) {
      return;
    }

    _selectedType = newType;
    _selectedStatus = newStatus;

    if (refresh || filterChanged) {
      _currentPage = 1;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _transactionService.getTransactions(
        type: _selectedType,
        status: _selectedStatus,
        page: _currentPage,
      );

      _transactions = res['data'] as List<TransactionModel>;
      _currentPage = res['current_page'] as int;
      _lastPage = res['last_page'] as int;
      _hasInitialLoaded = true;
    } catch (e) {
      _errorMessage = e.toString();
      // Error tercatat, tidak memicu auto-retry
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<TransactionUser?> checkUser(String ipayId) async {
    try {
      return await _transactionService.checkUser(ipayId);
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<Map<String, dynamic>?> transfer({
    required String toIpayId,
    required double amount,
    String? description,
    required String pin,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _transactionService.transfer(
        toIpayId: toIpayId,
        amount: amount,
        description: description,
        pin: pin,
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
}
