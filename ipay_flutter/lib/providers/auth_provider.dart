import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../core/storage/token_storage.dart';

enum AuthStatus { uninitialized, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  AuthStatus _status = AuthStatus.uninitialized;
  UserModel? _user;
  bool _isLoading = false;
  String? _errorMessage;

  AuthStatus get status => _status;
  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  AuthProvider() {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    final hasToken = await TokenStorage.hasToken();
    if (!hasToken) {
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return;
    }

    try {
      _user = await _authService.getProfile();
      _status = AuthStatus.authenticated;
    } catch (_) {
      await TokenStorage.clearAll();
      _user = null;
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login(String identifier, String pin) async {
    _setLoading(true);
    _errorMessage = null;
    try {
      final res = await _authService.login(identifier, pin);
      _user = res['user'] as UserModel;
      await TokenStorage.saveToken(res['token']);
      _status = AuthStatus.authenticated;
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setLoading(false);
      return false;
    }
  }

  Future<bool> register({
    required String name,
    String? email,
    String? phone,
    required String pin,
  }) async {
    _setLoading(true);
    _errorMessage = null;
    try {
      final res = await _authService.register(
        name: name,
        email: email,
        phone: phone,
        pin: pin,
      );
      _user = res['user'] as UserModel;
      await TokenStorage.saveToken(res['token']);
      _status = AuthStatus.authenticated;
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setLoading(false);
      return false;
    }
  }

  Future<void> logout() async {
    _setLoading(true);
    await _authService.logout();
    await TokenStorage.clearAll();
    _user = null;
    _status = AuthStatus.unauthenticated;
    _setLoading(false);
  }

  Future<void> refreshProfile() async {
    if (_status != AuthStatus.authenticated) return;
    try {
      _user = await _authService.getProfile();
      notifyListeners();
    } catch (_) {}
  }

  void updateLocalBalance(double newBalance) {
    if (_user != null) {
      _user = _user!.copyWith(balance: newBalance);
      notifyListeners();
    }
  }

  Future<bool> updateProfile({
    String? name,
    String? email,
    String? phone,
  }) async {
    _setLoading(true);
    _errorMessage = null;
    try {
      _user = await _authService.updateProfile(
        name: name,
        email: email,
        phone: phone,
      );
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setLoading(false);
      return false;
    }
  }

  Future<bool> changePin(String oldPin, String newPin) async {
    _setLoading(true);
    _errorMessage = null;
    try {
      await _authService.changePin(oldPin, newPin);
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setLoading(false);
      return false;
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
