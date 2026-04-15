class ProfessionalListing {
  final String id;
  final String name;
  final String city;
  final double rating;

  const ProfessionalListing({
    required this.id,
    required this.name,
    required this.city,
    required this.rating
  });

  factory ProfessionalListing.fromJson(Map<String, dynamic> json) {
    final ratingValue = json["rating"];
    return ProfessionalListing(
      id: json["id"]?.toString() ?? "",
      name: json["name"]?.toString() ?? "",
      city: json["city"]?.toString() ?? "",
      rating: double.tryParse(ratingValue?.toString() ?? "0") ?? 0
    );
  }
}
