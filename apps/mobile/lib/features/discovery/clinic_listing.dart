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
  final String? websiteUrl;
  final String? instagramUrl;
  final String? facebookUrl;
  final bool addedByCommunity;
  final bool isClaimed;
  final bool isVerified;
  /// Quando o pedido traz `Authorization: Bearer` válido e o utilizador é proprietário aprovado em [profile_owners].
  final bool viewerIsOwner;
  final double rating;
  /// Média das avaliações aprovadas no app (quando a API envia).
  final double? displayRating;
  final int displayReviewCount;
  final String? description;
  final List<ClinicProfessionalSummary> professionals;

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
    this.websiteUrl,
    this.instagramUrl,
    this.facebookUrl,
    required this.addedByCommunity,
    required this.isClaimed,
    required this.isVerified,
    this.viewerIsOwner = false,
    required this.rating,
    this.displayRating,
    this.displayReviewCount = 0,
    this.description,
    this.professionals = const []
  });

  /// Texto curto para lista: alinha com a ficha quando `displayRating` existe.
  String get ratingLineLabel {
    if (displayRating != null) {
      return "Nota ${displayRating!.toStringAsFixed(1)} • $displayReviewCount aval.";
    }
    return "Sem avaliações ainda";
  }

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
      websiteUrl: json["websiteUrl"]?.toString(),
      instagramUrl: json["instagramUrl"]?.toString(),
      facebookUrl: json["facebookUrl"]?.toString(),
      addedByCommunity: json["addedByCommunity"] == true,
      isClaimed: json["isClaimed"] == true,
      isVerified: json["isVerified"] == true,
      viewerIsOwner: json["viewerIsOwner"] == true,
      rating: double.tryParse(ratingValue?.toString() ?? "0") ?? 0,
      displayRating: json["displayRating"] != null
          ? double.tryParse(json["displayRating"].toString())
          : null,
      displayReviewCount: int.tryParse(json["displayReviewCount"]?.toString() ?? "0") ?? 0,
      description: json["description"]?.toString(),
      professionals: (json["professionals"] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(ClinicProfessionalSummary.fromJson)
          .toList()
    );
  }
}

class ClinicProfessionalSummary {
  final String id;
  final String name;
  final String? crm;

  const ClinicProfessionalSummary({required this.id, required this.name, this.crm});

  factory ClinicProfessionalSummary.fromJson(Map<String, dynamic> json) {
    final crmRaw = json["crm"]?.toString().trim();
    return ClinicProfessionalSummary(
      id: json["id"]?.toString() ?? "",
      name: json["name"]?.toString() ?? "",
      crm: (crmRaw != null && crmRaw.isNotEmpty) ? crmRaw : null
    );
  }
}
