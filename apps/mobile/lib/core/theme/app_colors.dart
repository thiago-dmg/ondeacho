import "package:flutter/material.dart";

/// Paleta definitiva OndeAcho — confiança, saúde, clareza.
abstract final class AppColors {
  static const Color primary = Color(0xFF0F766E);
  static const Color secondary = Color(0xFF14B8A6);
  static const Color accent = Color(0xFF2563EB);

  static const Color background = Color(0xFFF8FAFC);
  static const Color card = Color(0xFFFFFFFF);

  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);

  static const Color verified = Color(0xFF16A34A);
  static const Color attention = Color(0xFFF59E0B);
  static const Color neutral = Color(0xFF94A3B8);

  /// Fundo suave para badges de sucesso (verificado).
  static const Color verifiedBg = Color(0xFFDCFCE7);
  static const Color verifiedFg = Color(0xFF166534);

  /// Verificado — contraste um pouco mais forte (detalhe da clínica).
  static const Color verifiedBadgeBgStrong = Color(0xFFB8E8CC);
  static const Color verifiedBadgeFgStrong = Color(0xFF14532D);

  /// Reivindicado / info secundária.
  static const Color tealBadgeBg = Color(0xFFCCFBF1);
  static const Color tealBadgeFg = Color(0xFF0F766E);

  /// Comunidade / neutro.
  static const Color neutralBadgeBg = Color(0xFFF1F5F9);
  static const Color neutralBadgeFg = Color(0xFF475569);

  /// Sem avaliação / atenção suave.
  static const Color noRatingBg = Color(0xFFFEF3C7);
  static const Color noRatingFg = Color(0xFFB45309);

  static const Color star = Color(0xFFF59E0B);
  static const Color divider = Color(0xFFE2E8F0);

  static const Color shadow = Color(0x1A000000);
}
