import "package:flutter/material.dart";
import "../theme/app_colors.dart";
import "../theme/app_dimensions.dart";

enum AppBadgeVariant { verified, claimed, community, noRating, neutral }

/// Badge com cor de fundo + texto (não é só Chip genérico).
/// [claimed] usa estilo **outline** (secundário), [verified] com verde mais marcado.
class AppBadge extends StatelessWidget {
  final String label;
  final IconData? icon;
  final AppBadgeVariant variant;

  const AppBadge({
    super.key,
    required this.label,
    this.icon,
    this.variant = AppBadgeVariant.neutral
  });

  (Color bg, Color fg) get _colors {
    switch (variant) {
      case AppBadgeVariant.verified:
        return (AppColors.verifiedBadgeBgStrong, AppColors.verifiedBadgeFgStrong);
      case AppBadgeVariant.claimed:
        return (AppColors.neutralBadgeBg, AppColors.neutralBadgeFg);
      case AppBadgeVariant.community:
        return (AppColors.neutralBadgeBg, AppColors.neutralBadgeFg);
      case AppBadgeVariant.noRating:
        return (AppColors.noRatingBg, AppColors.noRatingFg);
      case AppBadgeVariant.neutral:
        return (AppColors.neutralBadgeBg, AppColors.neutralBadgeFg);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (variant == AppBadgeVariant.claimed) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(AppDim.radiusSm),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.42), width: 1.2)
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 14, color: AppColors.primary),
              const SizedBox(width: 4)
            ],
            Text(
              label,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.2
                  )
            )
          ]
        )
      );
    }

    final (bg, fg) = _colors;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppDim.radiusSm)
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: fg),
            const SizedBox(width: 4)
          ],
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: fg,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.2
                )
          )
        ]
      )
    );
  }
}
