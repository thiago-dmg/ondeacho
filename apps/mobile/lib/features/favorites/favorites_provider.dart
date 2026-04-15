import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "../../core/network/api_client.dart";

class FavoriteClinic {
  final String id;
  final String clinicId;
  final String clinicName;
  final String city;

  const FavoriteClinic({
    required this.id,
    required this.clinicId,
    required this.clinicName,
    required this.city
  });

  factory FavoriteClinic.fromJson(Map<String, dynamic> json) {
    final clinic = (json["clinic"] as Map<String, dynamic>? ?? const {});
    return FavoriteClinic(
      id: json["id"]?.toString() ?? "",
      clinicId: json["clinicId"]?.toString() ?? "",
      clinicName: clinic["name"]?.toString() ?? "Clínica",
      city: clinic["city"]?.toString() ?? "-"
    );
  }
}

class FavoritesNotifier extends Notifier<AsyncValue<List<FavoriteClinic>>> {
  late final Dio _dio;

  @override
  AsyncValue<List<FavoriteClinic>> build() {
    _dio = ref.read(dioProvider);
    return const AsyncValue.loading();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _dio.get<List<dynamic>>("/favorites");
      final list = (response.data ?? [])
          .whereType<Map<String, dynamic>>()
          .map(FavoriteClinic.fromJson)
          .toList();
      state = AsyncValue.data(list);
    } on DioException catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }

  Future<void> add(String clinicId) async {
    await _dio.post("/favorites", data: {"clinicId": clinicId});
    await load();
  }

  Future<void> remove(String clinicId) async {
    await _dio.delete("/favorites/$clinicId");
    await load();
  }
}

final favoritesProvider =
    NotifierProvider<FavoritesNotifier, AsyncValue<List<FavoriteClinic>>>(FavoritesNotifier.new);
