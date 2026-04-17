import "package:flutter/material.dart";
import "../theme/app_colors.dart";

class AppSectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;

  const AppSectionHeader({super.key, required this.title, this.subtitle});

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: t.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
              fontSize: 17
            )
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(
              subtitle!,
              style: t.bodySmall?.copyWith(color: AppColors.textSecondary, height: 1.35)
            )
          ]
        ]
      )
    );
  }
}
