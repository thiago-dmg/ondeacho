import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "../../core/network/api_client.dart";
import "../../core/storage/shared_prefs_provider.dart";

const _authTokenKey = "auth_token";

class UserProfile {
  final String id;
  final String name;
  final String email;
  final String role;

  const UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.role
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json["id"]?.toString() ?? "",
      name: json["name"]?.toString() ?? "",
      email: json["email"]?.toString() ?? "",
      role: json["role"]?.toString() ?? "responsavel"
    );
  }
}

class AuthState {
  final bool loading;
  final String? token;
  final UserProfile? profile;
  final String? error;

  const AuthState({this.loading = false, this.token, this.profile, this.error});
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
      Future.microtask(() => loadProfile());
    }
    return AuthState(token: savedToken);
  }

  Future<void> loadProfile() async {
    final token = state.token;
    if (token == null || token.isEmpty) {
      return;
    }
    try {
      final response = await _dio.get<Map<String, dynamic>>("/auth/me");
      final data = response.data ?? {};
      state = AuthState(
        token: token,
        profile: UserProfile.fromJson(data)
      );
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        await logout();
      }
    }
  }

  Future<bool> login({
    required String email,
    required String password
  }) async {
    state = AuthState(loading: true, token: state.token, profile: state.profile);
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        "/auth/login",
        data: {"email": email, "password": password}
      );
      final data = response.data ?? {};
      final accessToken = data["accessToken"] as String?;
      if (accessToken == null || accessToken.isEmpty) {
        state = AuthState(
          loading: false,
          token: state.token,
          profile: state.profile,
          error: "Token inválido."
        );
        return false;
      }
      _dio.options.headers["Authorization"] = "Bearer $accessToken";
      await ref.read(sharedPreferencesProvider).setString(_authTokenKey, accessToken);
      final userJson = data["user"] as Map<String, dynamic>?;
      final profile = userJson != null ? UserProfile.fromJson(userJson) : null;
      state = AuthState(loading: false, token: accessToken, profile: profile);
      if (profile == null) {
        await loadProfile();
      }
      return true;
    } on DioException catch (error) {
      final message = error.type == DioExceptionType.connectionError ||
              error.type == DioExceptionType.connectionTimeout
          ? "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
          : error.response?.data is Map<String, dynamic>
              ? (error.response?.data["message"]?.toString() ?? "Falha no login.")
              : "Falha no login.";
      state = AuthState(
        loading: false,
        token: state.token,
        profile: state.profile,
        error: message
      );
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password
  }) async {
    state = AuthState(loading: true, token: state.token, profile: state.profile);
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        "/auth/register",
        data: {"name": name.trim(), "email": email.trim(), "password": password}
      );
      final data = response.data ?? {};
      final accessToken = data["accessToken"] as String?;
      if (accessToken == null || accessToken.isEmpty) {
        state = AuthState(
          loading: false,
          token: state.token,
          profile: state.profile,
          error: "Token inválido."
        );
        return false;
      }
      _dio.options.headers["Authorization"] = "Bearer $accessToken";
      await ref.read(sharedPreferencesProvider).setString(_authTokenKey, accessToken);
      final userJson = data["user"] as Map<String, dynamic>?;
      final profile = userJson != null ? UserProfile.fromJson(userJson) : null;
      state = AuthState(loading: false, token: accessToken, profile: profile);
      if (profile == null) {
        await loadProfile();
      }
      return true;
    } on DioException catch (error) {
      final message = error.type == DioExceptionType.connectionError ||
              error.type == DioExceptionType.connectionTimeout
          ? "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
          : error.response?.data is Map<String, dynamic>
              ? (error.response?.data["message"]?.toString() ?? "Não foi possível criar a conta.")
              : "Não foi possível criar a conta.";
      state = AuthState(
        loading: false,
        token: state.token,
        profile: state.profile,
        error: message
      );
      return false;
    }
  }

  Future<bool> updateProfileName(String name) async {
    final token = state.token;
    if (token == null) {
      return false;
    }
    state = AuthState(loading: true, token: token, profile: state.profile);
    try {
      final response = await _dio.patch<Map<String, dynamic>>(
        "/auth/me",
        data: {"name": name.trim()}
      );
      final data = response.data ?? {};
      state = AuthState(
        loading: false,
        token: token,
        profile: UserProfile.fromJson(data)
      );
      return true;
    } on DioException catch (error) {
      final message = error.response?.data is Map<String, dynamic>
          ? (error.response?.data["message"]?.toString() ?? "Não foi possível salvar.")
          : "Não foi possível salvar.";
      state = AuthState(loading: false, token: token, profile: state.profile, error: message);
      return false;
    }
  }

  void clearError() {
    state = AuthState(loading: state.loading, token: state.token, profile: state.profile);
  }

  Future<void> logout() async {
    _dio.options.headers.remove("Authorization");
    await ref.read(sharedPreferencesProvider).remove(_authTokenKey);
    state = const AuthState();
  }
}

final authStateProvider = NotifierProvider<AuthStateNotifier, AuthState>(AuthStateNotifier.new);
