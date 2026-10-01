class AppConfig {
  // Base URL for Laravel API.
  static String get baseUrl {
    return 'http://127.0.0.1:8000/api';
  }

  static const String appName = 'iPay';
  static const Duration timeoutDuration = Duration(seconds: 15);
}
