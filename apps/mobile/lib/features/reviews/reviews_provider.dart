import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "../../core/network/api_client.dart";
import "review_models.dart";

String _dioMessage(DioException e) {
  final data = e.response?.data;
  if (data is Map<String, dynamic>) {
    final m = data["message"];
    if (m is String && m.isNotEmpty) {
      return m;
    }
    if (m is List && m.isNotEmpty) {
      return m.first.toString();
    }
  }
  return e.message ?? "Falha na rede.";
}

final reviewSummaryProvider =
    FutureProvider.autoDispose.family<ReviewSummary, String>((ref, clinicId) async {
  final id = clinicId.trim();
  if (id.isEmpty) {
    throw Exception("Não foi possível abrir avaliações: clínica sem identificador.");
  }
  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get<Map<String, dynamic>>("/reviews/listing/$id/summary");
    return ReviewSummary.fromJson(response.data ?? {});
  } on DioException catch (e) {
    throw Exception(_dioMessage(e));
  }
});

final clinicReviewsListProvider =
    FutureProvider.autoDispose.family<List<PublicReview>, String>((ref, clinicId) async {
  final id = clinicId.trim();
  if (id.isEmpty) {
    throw Exception("Não foi possível carregar comentários: clínica sem identificador.");
  }
  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get<List<dynamic>>("/reviews/listing/$id");
    final list = response.data ?? [];
    return list.whereType<Map<String, dynamic>>().map(PublicReview.fromJson).toList();
  } on DioException catch (e) {
    throw Exception(_dioMessage(e));
  }
});
