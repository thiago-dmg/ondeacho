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
    String? linkedClinicId,
    String? linkedClinicName,
    String? professionalCrm,
    String? phone,
    String? whatsappPhone,
    List<String> specialtyIds = const [],
    String? specialtyOther,
    List<String> insuranceIds = const [],
    String? insuranceOther,
    String? observations
  }) async {
    final data = <String, dynamic>{
      "targetType": targetType,
      "name": name,
      "city": city,
      "specialtyIds": specialtyIds,
      "insuranceIds": insuranceIds
    };
    if (neighborhood != null && neighborhood.isNotEmpty) {
      data["neighborhood"] = neighborhood;
    }
    if (addressLine != null && addressLine.isNotEmpty) {
      data["addressLine"] = addressLine;
    }
    if (phone != null && phone.isNotEmpty) {
      data["phone"] = phone;
    }
    if (whatsappPhone != null && whatsappPhone.isNotEmpty) {
      data["whatsappPhone"] = whatsappPhone;
    }
    if (observations != null && observations.isNotEmpty) {
      data["observations"] = observations;
    }
    if (linkedClinicId != null && linkedClinicId.isNotEmpty) {
      data["linkedClinicId"] = linkedClinicId;
    }
    if (linkedClinicName != null && linkedClinicName.isNotEmpty) {
      data["linkedClinicName"] = linkedClinicName;
    }
    if (professionalCrm != null && professionalCrm.isNotEmpty) {
      data["professionalCrm"] = professionalCrm;
    }
    if (specialtyOther != null && specialtyOther.isNotEmpty) {
      data["specialtyOther"] = specialtyOther;
    }
    if (insuranceOther != null && insuranceOther.isNotEmpty) {
      data["insuranceOther"] = insuranceOther;
    }
    await _dio.post("/clinic-suggestions", data: data);
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
    String? whatsappPhone,
    String? websiteUrl,
    String? instagramUrl,
    String? facebookUrl
  }) async {
    await _dio.patch(
      "/owner/profiles/clinics/$clinicId",
      data: {
        "name": name,
        "addressLine": addressLine,
        "phone": phone,
        "whatsappPhone": whatsappPhone,
        "websiteUrl": websiteUrl,
        "instagramUrl": instagramUrl,
        "facebookUrl": facebookUrl
      }
    );
  }
}

final collaborationApiProvider = Provider<CollaborationApi>((ref) {
  return CollaborationApi(ref.watch(dioProvider));
});
