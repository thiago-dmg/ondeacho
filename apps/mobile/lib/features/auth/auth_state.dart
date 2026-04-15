import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "../../core/network/api_client.dart";
import "../../core/storage/shared_prefs_provider.dart";

const _authTokenKey = "auth_token";

class AuthState {
  final bool loading;
  final String? token;
  final String? error;

  const AuthState({this.loading = false, this.token, this.error});

  AuthState copyWith({bool? loading, String? token, String? error}) {
    return AuthState(
      loading: loading ?? this.loading,
      token: token ?? this.token,
      error: error
    );
  }
}

class AuthStateNotifier extends Notifier<AuthState> {
  late final Dio _dio;

  @override
  AuthState build() {
    _dio = ref.read(dioProvider);
    final preferences = ref.read(sharedPreferencesProvider);
    final savedToken = preferences.getString(_authTokenKey);
    if (savedToken != null && savedToken.isNotEmpty) {
      _dio.options.headers["Authorization"] = "Bearer $savedToken";
    }
    return AuthState(token: savedToken);
  }

  Future<bool> login({
    required String email,
    required String password
  }) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        "/auth/login",
        data: {"email": email, "password": password}
      );
      final data = response.data ?? {};
      final accessToken = data["accessToken"] as String?;
      if (accessToken == null || accessToken.isEmpty) {
        state = state.copyWith(loading: false, error: "Token inválido.");
        return false;
      }
      _dio.options.headers["Authorization"] = "Bearer $accessToken";
      await ref.read(sharedPreferencesProvider).setString(_authTokenKey, accessToken);
      state = AuthState(loading: false, token: accessToken);
      return true;
    } on DioException catch (error) {
      final message = error.response?.data is Map<String, dynamic>
          ? (error.response?.data["message"]?.toString() ?? "Falha no login.")
          : "Falha no login.";
      state = AuthState(loading: false, error: message);
      return false;
    }
  }

  Future<void> logout() async {
    _dio.options.headers.remove("Authorization");
    await ref.read(sharedPreferencesProvider).remove(_authTokenKey);
    state = const AuthState();
  }
}

final authStateProvider = NotifierProvider<AuthStateNotifier, AuthState>(AuthStateNotifier.new);
