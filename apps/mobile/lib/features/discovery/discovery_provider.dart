import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "../../core/network/api_client.dart";
import "clinic_listing.dart";
import "professional_listing.dart";

class CatalogOption {
  final String id;
  final String name;

  const CatalogOption({required this.id, required this.name});

  factory CatalogOption.fromJson(Map<String, dynamic> json) {
    return CatalogOption(
      id: json["id"]?.toString() ?? "",
      name: json["name"]?.toString() ?? ""
    );
  }
}

class SelectedSpecialtyNotifier extends Notifier<String?> {
  @override
  String? build() => null;

  void set(String? value) => state = value;
}

class SelectedInsuranceNotifier extends Notifier<String?> {
  @override
  String? build() => null;

  void set(String? value) => state = value;
}

final selectedSpecialtyIdProvider =
    NotifierProvider<SelectedSpecialtyNotifier, String?>(SelectedSpecialtyNotifier.new);
final selectedInsuranceIdProvider =
    NotifierProvider<SelectedInsuranceNotifier, String?>(SelectedInsuranceNotifier.new);
final specialtiesProvider = FutureProvider<List<CatalogOption>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get<List<dynamic>>("/catalog/specialties");
  return (response.data ?? [])
      .whereType<Map<String, dynamic>>()
      .map(CatalogOption.fromJson)
      .toList();
});

final insurancesProvider = FutureProvider<List<CatalogOption>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get<List<dynamic>>("/catalog/insurances");
  return (response.data ?? [])
      .whereType<Map<String, dynamic>>()
      .map(CatalogOption.fromJson)
      .toList();
});

final clinicsProvider = FutureProvider<List<ClinicListing>>((ref) async {
  final dio = ref.watch(dioProvider);
  final specialtyId = ref.watch(selectedSpecialtyIdProvider);
  final insuranceId = ref.watch(selectedInsuranceIdProvider);
  try {
    final response = await dio.get<List<dynamic>>(
      "/listings",
      queryParameters: {
        "specialtyId": specialtyId,
        "insuranceId": insuranceId
      }
    );
    final list = response.data ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(ClinicListing.fromJson)
        .toList();
  } on DioException catch (error) {
    throw Exception(error.message ?? "Falha ao carregar clínicas.");
  }
});

final professionalsProvider = FutureProvider<List<ProfessionalListing>>((ref) async {
  final dio = ref.watch(dioProvider);
  final specialtyId = ref.watch(selectedSpecialtyIdProvider);
  final insuranceId = ref.watch(selectedInsuranceIdProvider);
  try {
    final response = await dio.get<List<dynamic>>(
      "/professionals",
      queryParameters: {
        "specialtyId": specialtyId,
        "insuranceId": insuranceId
      }
    );
    final list = response.data ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(ProfessionalListing.fromJson)
        .toList();
  } on DioException catch (error) {
    throw Exception(error.message ?? "Falha ao carregar profissionais.");
  }
});

final clinicDetailProvider =
    FutureProvider.family<ClinicListing, String>((ref, clinicId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get<Map<String, dynamic>>("/listings/$clinicId");
  return ClinicListing.fromJson(response.data ?? {});
});
