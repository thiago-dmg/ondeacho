/// UUID canônico (8-4-4-4-12 hex) como retornado por `GET /listings/:id` (`clinic.id`).
bool isValidUuid(String raw) {
  final s = raw.trim();
  return RegExp(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
  ).hasMatch(s);
}
