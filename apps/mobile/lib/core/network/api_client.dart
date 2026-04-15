import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

const _defaultApiBaseUrl = String.fromEnvironment(
  "API_BASE_URL",
  defaultValue: "http://10.0.2.2:3000/api/v1"
);

final apiBaseUrlProvider = Provider<String>((ref) => _defaultApiBaseUrl);

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: ref.watch(apiBaseUrlProvider),
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10)
    )
  );
  return dio;
});
