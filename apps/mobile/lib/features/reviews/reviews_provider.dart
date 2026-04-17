import "package:flutter_riverpod/flutter_riverpod.dart";
import "../../core/network/api_client.dart";
import "review_models.dart";

final reviewSummaryProvider =
    FutureProvider.autoDispose.family<ReviewSummary, String>((ref, clinicId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get<Map<String, dynamic>>("/reviews/listing/$clinicId/summary");
  return ReviewSummary.fromJson(response.data ?? {});
});

final clinicReviewsListProvider =
    FutureProvider.autoDispose.family<List<PublicReview>, String>((ref, clinicId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get<List<dynamic>>("/reviews/listing/$clinicId");
  final list = response.data ?? [];
  return list.whereType<Map<String, dynamic>>().map(PublicReview.fromJson).toList();
});
