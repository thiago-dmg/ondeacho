import "package:flutter/material.dart";

/// Tamanhos padrão Lucide (stroke) no app.
abstract final class LucideSize {
  static const double nav = 22;
  static const double body = 20;
  static const double lg = 24;
}

/// Ícone Lucide com tamanho consistente.
class LIcon extends StatelessWidget {
  final IconData data;
  final double size;
  final Color? color;

  const LIcon(this.data, {super.key, this.size = LucideSize.nav, this.color});

  @override
  Widget build(BuildContext context) {
    return Icon(data, size: size, color: color ?? IconTheme.of(context).color);
  }
}
