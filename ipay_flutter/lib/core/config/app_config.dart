class AppConfig {
  // Base URL for Laravel API.
  // 10.0.2.2 is the localhost loopback address for Android Emulator.
  // Change to your machine's local IP (e.g. http://192.168.1.x:8000/api) when testing on a physical device.
  static const String baseUrl = 'http://10.0.2.2:8000/api';
  
  static const String appName = 'iPay';
  static const Duration timeoutDuration = Duration(seconds: 15);
}
