/// Destino após login ou cadastro.
/// `?from=/profile` só indica que o usuário abriu o login pelo ícone da conta na home —
/// não deve redirecionar de volta ao perfil; a home é o fluxo esperado.
String postAuthLocation({required String? fromQuery, required bool wasRegister}) {
  if (wasRegister) {
    return "/discovery";
  }
  if (fromQuery == null || fromQuery.isEmpty) {
    return "/discovery";
  }
  final decoded = Uri.decodeComponent(fromQuery);
  final path = _pathOnly(decoded);
  if (path == "/profile") {
    return "/discovery";
  }
  return decoded;
}

String _pathOnly(String decoded) {
  if (decoded.isEmpty) {
    return "";
  }
  final uri = decoded.startsWith("/")
      ? Uri.parse("http://ondeacho.local$decoded")
      : Uri.tryParse(decoded);
  return uri?.path ?? "";
}
