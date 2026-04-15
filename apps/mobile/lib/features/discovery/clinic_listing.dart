class ClinicListing {
  final String id;
  final String name;
  final String city;
  final String? neighborhood;
  final String? addressLine;
  final String? addressNumber;
  final String? zipcode;
  final String? phone;
  final String? whatsappPhone;
  final bool addedByCommunity;
  final bool isClaimed;
  final bool isVerified;
  final double rating;
  final String? description;

  const ClinicListing({
    required this.id,
    required this.name,
    required this.city,
    this.neighborhood,
    this.addressLine,
    this.addressNumber,
    this.zipcode,
    this.phone,
    this.whatsappPhone,
    required this.addedByCommunity,
    required this.isClaimed,
    required this.isVerified,
    required this.rating,
    this.description
  });

  factory ClinicListing.fromJson(Map<String, dynamic> json) {
    final ratingValue = json["rating"];
    return ClinicListing(
      id: json["id"]?.toString() ?? "",
      name: json["name"]?.toString() ?? "",
      city: json["city"]?.toString() ?? "",
      neighborhood: json["neighborhood"]?.toString(),
      addressLine: json["addressLine"]?.toString(),
      addressNumber: json["addressNumber"]?.toString(),
      zipcode: json["zipcode"]?.toString(),
      phone: json["phone"]?.toString(),
      whatsappPhone: json["whatsappPhone"]?.toString(),
      addedByCommunity: json["addedByCommunity"] == true,
      isClaimed: json["isClaimed"] == true,
      isVerified: json["isVerified"] == true,
      rating: double.tryParse(ratingValue?.toString() ?? "0") ?? 0,
      description: json["description"]?.toString()
    );
  }
}
