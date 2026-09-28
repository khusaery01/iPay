import 'package:dio/dio.dart';
import '../core/network/api_client.dart';
import '../models/user_model.dart';

class AuthService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> login(String identifier, String pin) async {
    try {
      final response = await _api.post('/auth/login', data: {
        'identifier': identifier,
        'pin': pin,
      });

      final user = UserModel.fromJson(response.data['user']);
      final token = response.data['token'].toString();

      return {
        'user': user,
        'token': token,
        'message': response.data['message'] ?? 'Login berhasil.',
      };
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal login. Cek koneksi Anda.';
    }
  }

  Future<Map<String, dynamic>> register({
    required String name,
    String? email,
    String? phone,
    required String pin,
  }) async {
    try {
      final response = await _api.post('/auth/register', data: {
        'name': name,
        'email': email?.isEmpty == true ? null : email,
        'phone': phone?.isEmpty == true ? null : phone,
        'pin': pin,
      });

      final user = UserModel.fromJson(response.data['user']);
      final token = response.data['token'].toString();

      return {
        'user': user,
        'token': token,
        'message': response.data['message'] ?? 'Registrasi berhasil.',
      };
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal registrasi.';
    }
  }

  Future<void> logout() async {
    try {
      await _api.post('/auth/logout');
    } catch (_) {
      // Ignore network errors during logout
    }
  }

  Future<UserModel> getProfile() async {
    try {
      final response = await _api.get('/auth/me');
      return UserModel.fromJson(response.data['user']);
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal mengambil profil.';
    }
  }

  Future<UserModel> updateProfile({
    String? name,
    String? email,
    String? phone,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (name != null && name.isNotEmpty) data['name'] = name;
      if (email != null) data['email'] = email.isEmpty ? null : email;
      if (phone != null) data['phone'] = phone.isEmpty ? null : phone;

      final response = await _api.put('/auth/profile', data: data);
      return UserModel.fromJson(response.data['user']);
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal memperbarui profil.';
    }
  }

  Future<String> changePin(String oldPin, String newPin) async {
    try {
      final response = await _api.put('/auth/pin', data: {
        'old_pin': oldPin,
        'new_pin': newPin,
      });
      return response.data['message'] ?? 'PIN berhasil diubah.';
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Gagal mengubah PIN.';
    }
  }
}
