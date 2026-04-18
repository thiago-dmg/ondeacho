import "package:flutter/material.dart";
import "package:lucide_icons/lucide_icons.dart";
import "package:url_launcher/url_launcher.dart";
import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_dimensions.dart";
import "../../../core/widgets/app_badge.dart";
import "../../../core/widgets/lucide_icon.dart";
import "../clinic_listing.dart";

String _digitsOnly(String value) => value.replaceAll(RegExp(r"[^0-9]"), "");

String _addressQuery(ClinicListing c) {
  final street = [c.addressLine, c.addressNumber].where((v) => (v ?? "").trim().isNotEmpty).join(", ");
  final loc = [c.neighborhood, c.city].where((v) => (v ?? "").trim().isNotEmpty).join(" - ");
  final primary = [street, loc].where((v) => v.isNotEmpty).join(" • ");
  if (primary.isEmpty) {
    return c.city;
  }
  if (c.zipcode != null && c.zipcode!.isNotEmpty) {
    return "$primary • CEP ${c.zipcode}";
  }
  return primary;
}

/// Card premium de clínica — listagem (descoberta).
class ClinicCard extends StatelessWidget {
  final ClinicListing clinic;
  final VoidCallback onTap;

  const ClinicCard({super.key, required this.clinic, required this.onTap});

  Future<void> _openUri(BuildContext context, Uri uri, String err) async {
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!context.mounted) {
      return;
    }
    if (!ok) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final displayRating = clinic.displayRating;
    final reviewCount = clinic.displayReviewCount;
    final loc = [clinic.neighborhood, clinic.city].where((x) => (x ?? "").trim().isNotEmpty).join(" • ");
    final locationLine = loc.isEmpty ? clinic.city : loc;

    final phone = (clinic.phone ?? "").trim();
    final mapQuery = _addressQuery(clinic);

    final profPreview = clinic.professionals.length > 2
        ? "${clinic.professionals.take(2).map((p) => p.name).join(", ")}…"
        : clinic.professionals.map((p) => p.name).join(", ");

    return Container(
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
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppDim.radiusCard),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppDim.radiusCard),
          child: Padding(
            padding: const EdgeInsets.all(AppDim.space2),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        clinic.name,
                        style: t.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          fontSize: 18,
                          height: 1.25,
                          color: AppColors.textPrimary
                        ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis
                      )
                    ),
                    const SizedBox(width: 10),
                    if (displayRating != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10)
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const LIcon(LucideIcons.star, size: 18, color: AppColors.primary),
                            const SizedBox(width: 2),
                            Text(
                              displayRating.toStringAsFixed(1),
                              style: t.titleSmall?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary
                              )
                            )
                          ]
                        )
                      )
                    else
                      const AppBadge(
                        label: "Sem avaliação",
                        icon: LucideIcons.info,
                        variant: AppBadgeVariant.noRating
                      )
                  ]
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const LIcon(LucideIcons.mapPin, size: 18, color: AppColors.textSecondary),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        locationLine,
                        style: t.bodyMedium?.copyWith(color: AppColors.textSecondary, height: 1.35)
                      )
                    )
                  ]
                ),
                if (displayRating != null && reviewCount > 0) ...[
                  const SizedBox(height: 4),
                  Text(
                    "$reviewCount avaliações na comunidade",
                    style: t.labelSmall?.copyWith(color: AppColors.textSecondary)
                  )
                ],
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (clinic.isVerified)
                      const AppBadge(
                        label: "Verificado",
                        icon: LucideIcons.badgeCheck,
                        variant: AppBadgeVariant.verified
                      ),
                    if (clinic.isClaimed)
                      const AppBadge(
                        label: "Reivindicado",
                        icon: LucideIcons.badge,
                        variant: AppBadgeVariant.claimed
                      ),
                    if (clinic.addedByCommunity)
                      const AppBadge(
                        label: "Comunidade",
                        icon: LucideIcons.users,
                        variant: AppBadgeVariant.community
                      )
                  ]
                ),
                if (profPreview.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Text(
                    "Equipe: $profPreview",
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: t.bodySmall?.copyWith(color: AppColors.textSecondary, height: 1.4)
                  )
                ],
                const SizedBox(height: 16),
                Row(
                  children: [
                    if (phone.isNotEmpty) ...[
                      Expanded(
                        child: _CardActionButton(
                          icon: LucideIcons.phone,
                          label: "Ligar",
                          filled: true,
                          onPressed: () => _openUri(
                            context,
                            Uri(scheme: "tel", path: _digitsOnly(phone)),
                            "Não foi possível abrir o discador."
                          )
                        )
                      ),
                      const SizedBox(width: 10)
                    ],
                    Expanded(
                      child: _CardActionButton(
                        icon: LucideIcons.map,
                        label: "Mapa",
                        filled: phone.isEmpty,
                        onPressed: () => _openUri(
                          context,
                          Uri.parse(
                            "https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(mapQuery)}"
                          ),
                          "Não foi possível abrir o mapa."
                        )
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

class _CardActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool filled;
  final VoidCallback onPressed;

  const _CardActionButton({
    required this.icon,
    required this.label,
    required this.filled,
    required this.onPressed
  });

  @override
  Widget build(BuildContext context) {
    final child = Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        LIcon(icon, size: LucideSize.body),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14))
      ]
    );
    if (filled) {
      return FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDim.radiusButton))
        ),
        child: child
      );
    }
    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 12),
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.primary, width: 1.2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDim.radiusButton))
      ),
      child: child
    );
  }
}
