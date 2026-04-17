class ReviewSummary {
  final double? averageRating;
  final int reviewCount;

  const ReviewSummary({
    required this.averageRating,
    required this.reviewCount
  });

  factory ReviewSummary.fromJson(Map<String, dynamic> json) {
    double? toDouble(dynamic v) =>
        v == null ? null : double.tryParse(v.toString());

    return ReviewSummary(
      averageRating: toDouble(json["averageRating"]),
      reviewCount: int.tryParse(json["reviewCount"]?.toString() ?? "0") ?? 0
    );
  }
}

class PublicReview {
  final String id;
  final int rating;
  final String comment;
  final DateTime createdAt;
  final String authorName;

  const PublicReview({
    required this.id,
    required this.rating,
    required this.comment,
    required this.createdAt,
    required this.authorName
  });

  factory PublicReview.fromJson(Map<String, dynamic> json) {
    return PublicReview(
      id: json["id"]?.toString() ?? "",
      rating: int.tryParse(json["rating"]?.toString() ?? "0") ?? 0,
      comment: json["comment"]?.toString() ?? "",
      createdAt: DateTime.tryParse(json["createdAt"]?.toString() ?? "") ?? DateTime.now(),
      authorName: json["authorName"]?.toString() ?? "Usuário"
    );
  }
}
