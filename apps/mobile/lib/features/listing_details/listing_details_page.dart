import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "package:lucide_icons/lucide_icons.dart";
import "package:url_launcher/url_launcher.dart";
import "../../core/theme/app_colors.dart";
import "../../core/theme/app_dimensions.dart";
import "../../core/widgets/app_badge.dart";
import "../../core/widgets/app_rating_stars.dart";
import "../../core/widgets/app_section_header.dart";
import "../../core/widgets/lucide_icon.dart";
import "../auth/auth_state.dart";
import "../contacts/contacts_provider.dart";
import "../discovery/discovery_provider.dart";
import "../favorites/favorites_provider.dart";
import "../reviews/reviews_provider.dart";

class ListingDetailsPage extends ConsumerStatefulWidget {
  final String listingId;

  const ListingDetailsPage({super.key, required this.listingId});

  @override
  ConsumerState<ListingDetailsPage> createState() => _ListingDetailsPageState();
}

class _ListingDetailsPageState extends ConsumerState<ListingDetailsPage> {
  final _messageController = TextEditingController();

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  String _buildAddress({
    required String city,
    String? addressLine,
    String? addressNumber,
    String? neighborhood,
    String? zipcode
  }) {
    final street = [addressLine, addressNumber].where((v) => (v ?? "").trim().isNotEmpty).join(", ");
    final locationParts = [neighborhood, city].where((v) => (v ?? "").trim().isNotEmpty).join(" - ");
    final primary = [street, locationParts].where((v) => v.isNotEmpty).join(" • ");
    if (primary.isEmpty) {
      return city;
    }
    if (zipcode != null && zipcode.isNotEmpty) {
      return "$primary • CEP $zipcode";
    }
    return primary;
  }

  /// Duas linhas para leitura: (1) rua/número/bairro (2) cidade e CEP.
  ({String line1, String line2}) _addressLinesSplit({
    required String city,
    String? addressLine,
    String? addressNumber,
    String? neighborhood,
    String? zipcode
  }) {
    final street = [addressLine, addressNumber].where((v) => (v ?? "").trim().isNotEmpty).join(", ");
    final nb = (neighborhood ?? "").trim();
    var line1 = street;
    if (nb.isNotEmpty) {
      line1 = line1.isEmpty ? nb : "$line1 • $nb";
    }
    final cityT = city.trim();
    final z = (zipcode ?? "").trim();
    if (line1.isEmpty) {
      return (line1: cityT, line2: z.isNotEmpty ? "CEP $z" : "");
    }
    final line2 = z.isNotEmpty ? "$cityT • CEP $z" : cityT;
    return (line1: line1, line2: line2);
  }

  String _reviewCountLabel(int count) {
    if (count <= 0) {
      return "Nenhuma avaliação ainda";
    }
    if (count == 1) {
      return "1 avaliação na comunidade";
    }
    return "$count avaliações na comunidade";
  }

  String _digitsOnly(String value) => value.replaceAll(RegExp(r"[^0-9]"), "");

  Future<void> _openExternalUri(BuildContext context, Uri uri, {String? fallbackMessage}) async {
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!context.mounted) {
      return;
    }
    if (!opened) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(fallbackMessage ?? "Não foi possível abrir o aplicativo."))
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final listingId = widget.listingId;
    final clinicAsync = ref.watch(clinicDetailProvider(listingId));
    final isLoggedIn = ref.watch(authStateProvider).token != null;
    final channel = ValueNotifier<String>("whatsapp");

    Future<void> openContactDialog() async {
      if (!isLoggedIn) {
        context.push("/login?from=%2Flisting%2F$listingId");
        return;
      }
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        builder: (dialogContext) => Padding(
          padding: EdgeInsets.only(
            left: AppDim.space2,
            right: AppDim.space2,
            bottom: MediaQuery.of(dialogContext).viewInsets.bottom + AppDim.space2,
            top: AppDim.space1
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                "Registrar interesse",
                style: Theme.of(context).textTheme.titleLarge
              ),
              const SizedBox(height: 8),
              Text(
                "Sua mensagem ajuda a clínica a entender sua necessidade. Você acompanha em “Contatos enviados” na sua conta (é diferente de favoritar).",
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)
              ),
              const SizedBox(height: 16),
              ValueListenableBuilder<String>(
                valueListenable: channel,
                builder: (context, value, _) => DropdownButtonFormField<String>(
                  initialValue: value,
                  decoration: const InputDecoration(labelText: "Canal preferido"),
                  items: const [
                    DropdownMenuItem(value: "whatsapp", child: Text("WhatsApp")),
                    DropdownMenuItem(value: "phone", child: Text("Telefone")),
                    DropdownMenuItem(value: "email", child: Text("E-mail"))
                  ],
                  onChanged: (next) {
                    if (next != null) {
                      channel.value = next;
                    }
                  }
                )
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _messageController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: "Mensagem (opcional)",
                  alignLabelWithHint: true
                )
              ),
              const SizedBox(height: 20),
              FilledButton(
                onPressed: () async {
                  await ref.read(contactsProvider.notifier).send(
                        clinicId: listingId,
                        preferredChannel: channel.value,
                        message: _messageController.text
                      );
                  if (dialogContext.mounted) {
                    Navigator.of(dialogContext).pop();
                  }
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Interesse registrado com sucesso."))
                    );
                  }
                },
                child: const Text("Enviar interesse")
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => Navigator.of(dialogContext).pop(),
                child: const Text("Cancelar")
              )
            ]
          )
        )
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("Clínica"),
        actions: [
          IconButton(
            onPressed: () {
              ref.invalidate(clinicDetailProvider(listingId));
              ref.invalidate(reviewSummaryProvider(listingId));
            },
            icon: const LIcon(LucideIcons.refreshCw),
            tooltip: "Atualizar"
          )
        ]
      ),
      bottomNavigationBar: clinicAsync.maybeWhen(
        data: (clinic) => SafeArea(
          child: Material(
            elevation: 12,
            color: AppColors.card,
            shadowColor: AppColors.shadow,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  _BottomBarItem(
                    icon: LucideIcons.heart,
                    label: "Salvar",
                    iconSize: 24,
                    onPressed: () async {
                      if (!isLoggedIn) {
                        context.push("/login?from=%2Flisting%2F$listingId");
                        return;
                      }
                      try {
                        await ref.read(favoritesProvider.notifier).add(listingId);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text("Adicionado aos favoritos."))
                          );
                        }
                      } catch (error) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text("Erro ao favoritar: $error"))
                          );
                        }
                      }
                    }
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: openContactDialog,
                      icon: const LIcon(LucideIcons.send, color: Colors.white, size: 20),
                      label: const Text("Contato"),
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)
                        )
                      )
                    )
                  ),
                  if ((isLoggedIn && clinic.viewerIsOwner) || !clinic.isClaimed) ...[
                    const SizedBox(width: 10),
                    PopupMenuButton<String>(
                      tooltip: "Mais opções",
                      icon: const LIcon(LucideIcons.moreHorizontal, size: 24),
                      onSelected: (value) {
                        if (value == "edit" && isLoggedIn && clinic.viewerIsOwner) {
                          context.push(
                            "/owner/clinic/$listingId/edit"
                            "?name=${Uri.encodeComponent(clinic.name)}"
                            "&addressLine=${Uri.encodeComponent(clinic.addressLine ?? "")}"
                            "&phone=${Uri.encodeComponent(clinic.phone ?? "")}"
                            "&whatsappPhone=${Uri.encodeComponent(clinic.whatsappPhone ?? "")}"
                          );
                        }
                        if (value == "claim" && !clinic.isClaimed) {
                          context.push(
                            "/claim/$listingId?name=${Uri.encodeComponent(clinic.name)}"
                          );
                        }
                      },
                      itemBuilder: (context) => [
                        if (isLoggedIn && clinic.viewerIsOwner)
                          const PopupMenuItem(value: "edit", child: Text("Editar dados da clínica")),
                        if (!clinic.isClaimed)
                          const PopupMenuItem(
                            value: "claim",
                            child: Text("Sou responsável por esta clínica")
                          )
                      ]
                    )
                  ]
                ]
              )
            )
          )
        ),
        orElse: () => const SizedBox.shrink()
      ),
      body: clinicAsync.when(
        data: (clinic) {
          final normalizedPhone = (clinic.phone ?? "").trim();
          final normalizedWhatsapp = (clinic.whatsappPhone ?? "").trim();
          final addressText = _buildAddress(
            city: clinic.city,
            addressLine: clinic.addressLine,
            addressNumber: clinic.addressNumber,
            neighborhood: clinic.neighborhood,
            zipcode: clinic.zipcode
          );
          final addressLines = _addressLinesSplit(
            city: clinic.city,
            addressLine: clinic.addressLine,
            addressNumber: clinic.addressNumber,
            neighborhood: clinic.neighborhood,
            zipcode: clinic.zipcode
          );
          final summaryAsync = ref.watch(reviewSummaryProvider(listingId));

          return SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: AppDim.space3),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                ColoredBox(
                  color: AppColors.card,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 12, 20, 18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              clinic.name,
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: -0.35,
                                    height: 1.28,
                                    fontSize: 22,
                                    color: AppColors.textPrimary
                                  )
                            ),
                            const SizedBox(height: 14),
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
                            )
                          ]
                        )
                      ),
                      const Divider(height: 1, thickness: 1, color: AppColors.divider),
                    ]
                  )
                ),
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      summaryAsync.when(
                        data: (s) {
                          final main = s.averageRating;
                          return Container(
                            decoration: BoxDecoration(
                              color: AppColors.card,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.divider, width: 1),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.05),
                                  blurRadius: 10,
                                  offset: const Offset(0, 2)
                                )
                              ]
                            ),
                            clipBehavior: Clip.antiAlias,
                            child: Material(
                              color: Colors.transparent,
                              child: InkWell(
                                onTap: () => context.push(
                                  "/listing/$listingId/reviews?name=${Uri.encodeComponent(clinic.name)}"
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                  child: Row(
                                    children: [
                                      if (main != null) ...[
                                        Container(
                                          width: 56,
                                          height: 56,
                                          decoration: BoxDecoration(
                                            color: AppColors.primary.withValues(alpha: 0.08),
                                            borderRadius: BorderRadius.circular(14)
                                          ),
                                          alignment: Alignment.center,
                                          child: Text(
                                            main.toStringAsFixed(1),
                                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                                  fontWeight: FontWeight.w800,
                                                  height: 1,
                                                  color: AppColors.primary,
                                                  letterSpacing: -0.5
                                                )
                                          )
                                        ),
                                        const SizedBox(width: 14),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              AppRatingStars(value: main, size: 22),
                                              const SizedBox(height: 6),
                                              Text(
                                                _reviewCountLabel(s.reviewCount),
                                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                      color: AppColors.textSecondary,
                                                      fontWeight: FontWeight.w500,
                                                      height: 1.25
                                                    )
                                              )
                                            ]
                                          )
                                        ),
                                        const LIcon(LucideIcons.chevronRight, size: 20, color: AppColors.neutral)
                                      ] else ...[
                                        Container(
                                          width: 44,
                                          height: 44,
                                          decoration: BoxDecoration(
                                            color: AppColors.neutralBadgeBg,
                                            borderRadius: BorderRadius.circular(12)
                                          ),
                                          alignment: Alignment.center,
                                          child: const LIcon(
                                            LucideIcons.starOff,
                                            size: 22,
                                            color: AppColors.textSecondary
                                          )
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                "Sem avaliações na comunidade",
                                                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                                      fontWeight: FontWeight.w600,
                                                      color: AppColors.textPrimary,
                                                      height: 1.2
                                                    )
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                "Seja o primeiro a avaliar esta clínica.",
                                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                      color: AppColors.textSecondary,
                                                      height: 1.3
                                                    )
                                              )
                                            ]
                                          )
                                        ),
                                        const LIcon(LucideIcons.chevronRight, size: 20, color: AppColors.neutral)
                                      ]
                                    ]
                                  )
                                )
                              )
                            )
                          );
                        },
                        loading: () => const Center(child: LinearProgressIndicator(minHeight: 3)),
                        error: (e, st) => Text(
                          "Não foi possível carregar o resumo de avaliações.",
                          style: Theme.of(context).textTheme.bodyLarge
                        )
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Toque para ver ou enviar uma avaliação.",
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.textSecondary.withValues(alpha: 0.95),
                              height: 1.35
                            )
                      ),
                      const SizedBox(height: AppDim.space3),
                      const Divider(height: 1),
                      const SizedBox(height: AppDim.space2),
                      const AppSectionHeader(title: "Localização e contato"),
                      const SizedBox(height: 12),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Padding(
                            padding: EdgeInsets.only(top: 2),
                            child: LIcon(LucideIcons.mapPin, size: LucideSize.lg, color: AppColors.textSecondary),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  addressLines.line1,
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                        height: 1.55,
                                        color: AppColors.textPrimary
                                      )
                                ),
                                if (addressLines.line2.isNotEmpty) ...[
                                  const SizedBox(height: 6),
                                  Text(
                                    addressLines.line2,
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          height: 1.55,
                                          color: AppColors.textPrimary
                                        )
                                  )
                                ]
                              ]
                            )
                          )
                        ]
                      ),
                      if ((clinic.phone?.isNotEmpty ?? false) ||
                          (clinic.whatsappPhone?.isNotEmpty ?? false)) ...[
                        const SizedBox(height: 16),
                        Text(
                          "Telefone: ${clinic.phone ?? "—"}"
                          "${clinic.whatsappPhone != null && clinic.whatsappPhone!.isNotEmpty ? " • WhatsApp: ${clinic.whatsappPhone}" : ""}",
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)
                        )
                      ],
                      const SizedBox(height: 18),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (normalizedPhone.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 10),
                              child: FilledButton.icon(
                                onPressed: () async {
                                  await _openExternalUri(
                                    context,
                                    Uri(scheme: "tel", path: _digitsOnly(normalizedPhone)),
                                    fallbackMessage: "Não foi possível abrir o discador."
                                  );
                                },
                                icon: const LIcon(LucideIcons.phone),
                                label: const Text("Ligar"),
                                style: FilledButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 14)
                                )
                              )
                            ),
                          if (normalizedWhatsapp.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 10),
                              child: FilledButton.icon(
                                onPressed: () async {
                                  await _openExternalUri(
                                    context,
                                    Uri.parse("https://wa.me/${_digitsOnly(normalizedWhatsapp)}"),
                                    fallbackMessage: "Não foi possível abrir o WhatsApp."
                                  );
                                },
                                icon: const LIcon(LucideIcons.messageCircle),
                                label: const Text("WhatsApp"),
                                style: FilledButton.styleFrom(
                                  backgroundColor: AppColors.secondary,
                                  padding: const EdgeInsets.symmetric(vertical: 14)
                                )
                              )
                            ),
                          OutlinedButton.icon(
                            onPressed: () async {
                              await _openExternalUri(
                                context,
                                Uri.parse(
                                  "https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(addressText)}"
                                ),
                                fallbackMessage: "Não foi possível abrir o mapa."
                              );
                            },
                            icon: LIcon(LucideIcons.map, color: AppColors.textSecondary.withValues(alpha: 0.9)),
                            label: const Text("Abrir no mapa"),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              foregroundColor: AppColors.textSecondary,
                              backgroundColor: AppColors.neutralBadgeBg,
                              side: BorderSide(color: AppColors.divider.withValues(alpha: 0.9)),
                              elevation: 0
                            )
                          )
                        ]
                      ),
                      if (clinic.description != null && clinic.description!.isNotEmpty) ...[
                        const SizedBox(height: AppDim.space3),
                        const Divider(height: 1),
                        const SizedBox(height: AppDim.space2),
                        const AppSectionHeader(title: "Sobre"),
                        Text(
                          clinic.description!,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)
                        )
                      ],
                      const SizedBox(height: AppDim.space3),
                      const Divider(height: 1),
                      const SizedBox(height: AppDim.space2),
                      const AppSectionHeader(title: "Profissionais nesta clínica"),
                      const SizedBox(height: 8),
                      if (clinic.professionals.isEmpty)
                        Text(
                          "Nenhum profissional vinculado ainda.",
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)
                        )
                      else
                        ...clinic.professionals.map(
                          (professional) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.card,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.divider)
                              ),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: AppColors.primary.withValues(alpha: 0.12),
                                    child: const LIcon(LucideIcons.user, color: AppColors.primary)
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      professional.name,
                                      style: Theme.of(context).textTheme.titleSmall
                                    )
                                  )
                                ]
                              )
                            )
                          )
                        ),
                      const SizedBox(height: AppDim.space2),
                      if (!clinic.isClaimed)
                        Center(
                          child: TextButton(
                            onPressed: () {
                              context.push(
                                "/claim/$listingId?name=${Uri.encodeComponent(clinic.name)}"
                              );
                            },
                            child: const Text("Sou responsável por esta clínica")
                          )
                        )
                      else
                        Center(
                          child: Text(
                            "Esta clínica já possui perfil reivindicado.",
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)
                          )
                        )
                    ]
                  )
                )
              ]
            )
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text("Erro ao carregar detalhes: $error"))
      )
    );
  }
}

class _BottomBarItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onPressed;
  final double iconSize;

  const _BottomBarItem({
    required this.icon,
    required this.label,
    required this.onPressed,
    this.iconSize = 24
  });

  @override
  Widget build(BuildContext context) {
    const color = AppColors.textSecondary;
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            LIcon(icon, size: iconSize, color: color),
            const SizedBox(height: 6),
            Text(
              label,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: color,
                    fontWeight: FontWeight.w600
                  )
            )
          ]
        )
      )
    );
  }
}
