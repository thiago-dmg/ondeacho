import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "../../core/network/api_client.dart";

class ContactRequest {
  final String id;
  final String clinicId;
  final String clinicName;
  final String preferredChannel;
  final String? message;
  final DateTime? createdAt;

  const ContactRequest({
    required this.id,
    required this.clinicId,
    required this.clinicName,
    required this.preferredChannel,
    this.message,
    this.createdAt
  });

  factory ContactRequest.fromJson(Map<String, dynamic> json) {
    final clinic = (json["clinic"] as Map<String, dynamic>? ?? const {});
    return ContactRequest(
      id: json["id"]?.toString() ?? "",
      clinicId: json["clinicId"]?.toString() ?? "",
      clinicName: clinic["name"]?.toString() ?? "Clínica",
      preferredChannel: json["preferredChannel"]?.toString() ?? "whatsapp",
      message: json["message"]?.toString(),
      createdAt: json["createdAt"] != null ? DateTime.tryParse(json["createdAt"].toString()) : null
    );
  }
}

String contactChannelLabel(String channel) {
  switch (channel) {
    case "whatsapp":
      return "WhatsApp";
    case "email":
      return "E-mail";
    case "phone":
      return "Telefone";
    default:
      return channel;
  }
}

class ContactsNotifier extends Notifier<AsyncValue<void>> {
  late final Dio _dio;

  @override
  AsyncValue<void> build() {
    _dio = ref.read(dioProvider);
    return const AsyncValue.data(null);
  }

  Future<void> send({
    required String clinicId,
    required String preferredChannel,
    String? message
  }) async {
    state = const AsyncValue.loading();
    try {
      await _dio.post(
        "/contacts",
        data: {
          "clinicId": clinicId,
          "preferredChannel": preferredChannel,
          "message": (message == null || message.trim().isEmpty) ? null : message.trim()
        }
      );
      state = const AsyncValue.data(null);
    } on DioException catch (error, stack) {
      state = AsyncValue.error(error, stack);
    }
  }
}

final contactsProvider =
    NotifierProvider<ContactsNotifier, AsyncValue<void>>(ContactsNotifier.new);

final myContactsProvider = FutureProvider<List<ContactRequest>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get<List<dynamic>>("/contacts/mine");
  return (response.data ?? [])
      .whereType<Map<String, dynamic>>()
      .map(ContactRequest.fromJson)
      .toList();
});
