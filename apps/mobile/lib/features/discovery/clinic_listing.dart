class ClinicListing {
  final String id;
  final String name;
  final String city;
  final double rating;
  final String? description;

  const ClinicListing({
    required this.id,
    required this.name,
    required this.city,
    required this.rating,
    this.description
  });

  factory ClinicListing.fromJson(Map<String, dynamic> json) {
    final ratingValue = json["rating"];
    return ClinicListing(
      id: json["id"]?.toString() ?? "",
      name: json["name"]?.toString() ?? "",
      city: json["city"]?.toString() ?? "",
      rating: double.tryParse(ratingValue?.toString() ?? "0") ?? 0,
      description: json["description"]?.toString()
    );
  }
}
