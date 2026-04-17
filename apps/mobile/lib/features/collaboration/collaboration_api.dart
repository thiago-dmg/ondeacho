import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "../../core/network/api_client.dart";

class CollaborationApi {
  CollaborationApi(this._dio);

  final Dio _dio;

  Future<void> suggest({
    required String targetType,
    required String name,
    required String city,
    String? neighborhood,
    String? addressLine,
    String? phone,
    String? whatsappPhone,
    List<String>? specialtyNames,
    List<String>? insuranceNames,
    String? observations
  }) async {
    await _dio.post(
      "/clinic-suggestions",
      data: {
        "targetType": targetType,
        "name": name,
        "city": city,
        "neighborhood": neighborhood,
        "addressLine": addressLine,
        "phone": phone,
        "whatsappPhone": whatsappPhone,
        "specialtyNames": specialtyNames ?? [],
        "insuranceNames": insuranceNames ?? [],
        "observations": observations
      }
    );
  }

  Future<void> claimProfile({
    required String requesterName,
    required String requesterEmail,
    required String requesterPhone,
    String? message,
    String? clinicId,
    String? professionalId
  }) async {
    await _dio.post(
      "/profile-claims",
      data: {
        "clinicId": clinicId,
        "professionalId": professionalId,
        "requesterName": requesterName,
        "requesterEmail": requesterEmail,
        "requesterPhone": requesterPhone,
        "message": message
      }
    );
  }

  Future<void> updateOwnedClinic({
    required String clinicId,
    String? name,
    String? addressLine,
    String? phone,
    String? whatsappPhone
  }) async {
    await _dio.patch(
      "/owner/profiles/clinics/$clinicId",
      data: {
        "name": name,
        "addressLine": addressLine,
        "phone": phone,
        "whatsappPhone": whatsappPhone
      }
    );
  }
}

final collaborationApiProvider = Provider<CollaborationApi>((ref) {
  return CollaborationApi(ref.watch(dioProvider));
});
