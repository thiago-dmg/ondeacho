import "package:flutter/material.dart";
import "package:lucide_icons/lucide_icons.dart";
import "../theme/app_colors.dart";
import "lucide_icon.dart";

/// Estrelas para exibição (somente leitura).
class AppRatingStars extends StatelessWidget {
  final double value;
  final double size;
  final Color? color;

  const AppRatingStars({
    super.key,
    required this.value,
    this.size = 18,
    this.color
  });

  @override
  Widget build(BuildContext context) {
    final full = value.round().clamp(0, 5);
    final c = color ?? AppColors.star;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        return Padding(
          padding: const EdgeInsets.only(right: 2),
          child: LIcon(
            i < full ? LucideIcons.star : LucideIcons.starOff,
            size: size,
            color: i < full ? c : AppColors.neutral.withValues(alpha: 0.45)
          )
        );
      })
    );
  }
}

/// Estrelas interativas com microanimação ao toque.
class AppInteractiveStars extends StatefulWidget {
  final int value;
  final ValueChanged<int> onChanged;
  final double size;

  const AppInteractiveStars({
    super.key,
    required this.value,
    required this.onChanged,
    this.size = 32
  });

  @override
  State<AppInteractiveStars> createState() => _AppInteractiveStarsState();
}

class _AppInteractiveStarsState extends State<AppInteractiveStars> {
  int? _pressed;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        final v = i + 1;
        final selected = v <= widget.value;
        return Padding(
          padding: const EdgeInsets.only(right: 4),
          child: GestureDetector(
            onTapDown: (_) => setState(() => _pressed = v),
            onTapUp: (_) => setState(() => _pressed = null),
            onTapCancel: () => setState(() => _pressed = null),
            onTap: () => widget.onChanged(v),
            child: AnimatedScale(
              scale: _pressed == v ? 0.88 : 1,
              duration: const Duration(milliseconds: 100),
              curve: Curves.easeOutCubic,
              child: LIcon(
                selected ? LucideIcons.star : LucideIcons.starOff,
                size: widget.size,
                color: selected ? AppColors.star : AppColors.neutral
              )
            )
          )
        );
      })
    );
  }
}
