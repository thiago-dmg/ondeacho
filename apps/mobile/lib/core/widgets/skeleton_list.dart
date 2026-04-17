import "package:flutter/material.dart";
import "../theme/app_colors.dart";
import "../theme/app_dimensions.dart";

/// Placeholder para carregamento de lista (sem dependência extra).
class SkeletonBlock extends StatelessWidget {
  final double height;
  final double? width;
  final BorderRadius? borderRadius;

  const SkeletonBlock({
    super.key,
    required this.height,
    this.width,
    this.borderRadius
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.neutral.withValues(alpha: 0.22),
        borderRadius: borderRadius ?? BorderRadius.circular(AppDim.radiusSm)
      )
    );
  }
}

/// Lista de cards esqueleto (home / busca).
class ClinicListSkeleton extends StatelessWidget {
  final int count;

  const ClinicListSkeleton({super.key, this.count = 4});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        count,
        (i) => Padding(
          padding: EdgeInsets.only(bottom: i == count - 1 ? 0 : AppDim.space2),
          child: Container(
            padding: const EdgeInsets.all(AppDim.space2),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(AppDim.radiusCard),
              boxShadow: [
                BoxShadow(
                  color: AppColors.shadow,
                  blurRadius: AppDim.cardShadowBlur,
                  offset: const Offset(0, AppDim.cardShadowY)
                )
              ]
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Expanded(child: SkeletonBlock(height: 20)),
                    const SizedBox(width: 12),
                    SkeletonBlock(
                      height: 20,
                      width: 48,
                      borderRadius: BorderRadius.circular(8)
                    )
                  ]
                ),
                const SizedBox(height: 12),
                const SkeletonBlock(height: 14, width: 180),
                const SizedBox(height: 12),
                const Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    SkeletonBlock(height: 26, width: 88, borderRadius: BorderRadius.all(Radius.circular(8))),
                    SkeletonBlock(height: 26, width: 96, borderRadius: BorderRadius.all(Radius.circular(8)))
                  ]
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: SkeletonBlock(
                        height: 40,
                        borderRadius: BorderRadius.circular(AppDim.radiusButton)
                      )
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: SkeletonBlock(
                        height: 40,
                        borderRadius: BorderRadius.circular(AppDim.radiusButton)
                      )
                    )
                  ]
                )
              ]
            )
          )
        )
      )
    );
  }
}
