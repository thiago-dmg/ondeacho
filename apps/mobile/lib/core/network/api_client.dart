import "package:dio/dio.dart";
import "package:flutter/foundation.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

/// Produção: `https://api.ondeachotea.com/api/v1`. Para API local no emulador Android:
/// `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api/v1`
/// iOS Simulator: `--dart-define=API_BASE_URL=http://127.0.0.1:3000/api/v1`
const _defaultApiBaseUrl = String.fromEnvironment(
  "API_BASE_URL",
  defaultValue: "https://api.ondeachotea.com/api/v1"
);

final apiBaseUrlProvider = Provider<String>((ref) => _defaultApiBaseUrl);

final dioProvider = Provider<Dio>((ref) {
  final baseUrl = ref.watch(apiBaseUrlProvider);
  if (kDebugMode) {
    debugPrint("[OndeAcho] API_BASE_URL=$baseUrl");
  }
  final dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15)
    )
  );
  return dio;
});
