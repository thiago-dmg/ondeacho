import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "package:lucide_icons/lucide_icons.dart";
import "../../core/theme/app_colors.dart";
import "../../core/theme/app_dimensions.dart";
import "../../core/widgets/app_section_header.dart";
import "../../core/widgets/lucide_icon.dart";
import "../../core/widgets/skeleton_list.dart";
import "../auth/auth_state.dart";
import "discovery_provider.dart";
import "widgets/clinic_card.dart";

class DiscoveryPage extends ConsumerWidget {
  const DiscoveryPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final clinicsAsync = ref.watch(clinicsProvider);
    final specialtiesAsync = ref.watch(specialtiesProvider);
    final insurancesAsync = ref.watch(insurancesProvider);
    final selectedSpecialty = ref.watch(selectedSpecialtyIdProvider);
    final selectedInsurance = ref.watch(selectedInsuranceIdProvider);
    final hasSelectedFilter = selectedSpecialty != null || selectedInsurance != null;
    final auth = ref.watch(authStateProvider);
    final isLoggedIn = auth.token != null;
    final profile = auth.profile;

    return Scaffold(
      appBar: AppBar(
        toolbarHeight: isLoggedIn && profile != null ? 72 : 56,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              "Clínicas",
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                    fontSize: 22,
                    letterSpacing: -0.3,
                    color: AppColors.textPrimary
                  )
            ),
            if (isLoggedIn && profile != null) ...[
              const SizedBox(height: 4),
              Text(
                profile.name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                      height: 1.25
                    )
              )
            ]
          ]
        ),
        actions: [
          IconButton(
            tooltip: "Favoritos",
            onPressed: () {
              if (isLoggedIn) {
                context.push("/favorites");
                return;
              }
              context.push("/login?from=%2Ffavorites");
            },
            icon: const LIcon(LucideIcons.heart)
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: IconButton(
              tooltip: isLoggedIn ? "Minha conta" : "Entrar",
              onPressed: () {
                if (isLoggedIn) {
                  context.push("/profile");
                  return;
                }
                context.push("/login?from=%2Fprofile");
              },
              icon: const LIcon(LucideIcons.user)
            )
          )
        ]
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppDim.space2, AppDim.space2, AppDim.space2, 0),
            child: Container(
              padding: const EdgeInsets.all(AppDim.space2),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(AppDim.radiusCard),
                border: Border.all(color: AppColors.divider),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.shadow,
                    blurRadius: 8,
                    offset: const Offset(0, 2)
                  )
                ]
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const AppSectionHeader(
                    title: "Filtros",
                    subtitle: "Escolha especialidade e/ou convênio para ver clínicas alinhadas à sua busca."
                  ),
                  specialtiesAsync.when(
                    data: (items) => DropdownButtonFormField<String?>(
                      key: ValueKey<String?>("spec_${selectedSpecialty ?? "all"}"),
                      initialValue: selectedSpecialty,
                      decoration: const InputDecoration(
                        labelText: "Especialidade",
                        prefixIcon: LIcon(LucideIcons.stethoscope, size: LucideSize.body)
                      ),
                      items: [
                        const DropdownMenuItem(value: null, child: Text("Todas")),
                        ...items.map(
                          (item) => DropdownMenuItem(value: item.id, child: Text(item.name))
                        )
                      ],
                      onChanged: (value) =>
                          ref.read(selectedSpecialtyIdProvider.notifier).set(value)
                    ),
                    loading: () => const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: LinearProgressIndicator(minHeight: 3)
                    ),
                    error: (error, stack) => Text(
                      "Não foi possível carregar especialidades.",
                      style: TextStyle(color: Theme.of(context).colorScheme.error)
                    )
                  ),
                  const SizedBox(height: AppDim.space1),
                  insurancesAsync.when(
                    data: (items) => DropdownButtonFormField<String?>(
                      key: ValueKey<String?>("ins_${selectedInsurance ?? "all"}"),
                      initialValue: selectedInsurance,
                      decoration: const InputDecoration(
                        labelText: "Convênio",
                        prefixIcon: LIcon(LucideIcons.shield, size: LucideSize.body)
                      ),
                      items: [
                        const DropdownMenuItem(value: null, child: Text("Todos")),
                        ...items.map(
                          (item) => DropdownMenuItem(value: item.id, child: Text(item.name))
                        )
                      ],
                      onChanged: (value) =>
                          ref.read(selectedInsuranceIdProvider.notifier).set(value)
                    ),
                    loading: () => const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: LinearProgressIndicator(minHeight: 3)
                    ),
                    error: (error, stack) => Text(
                      "Não foi possível carregar convênios.",
                      style: TextStyle(color: Theme.of(context).colorScheme.error)
                    )
                  )
                ]
              )
            )
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(AppDim.space2),
              children: [
                if (!hasSelectedFilter) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(AppDim.space2),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(AppDim.radiusCard),
                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.15))
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const LIcon(LucideIcons.compass, color: AppColors.primary, size: LucideSize.nav),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            "Descubra clínicas verificadas pela comunidade. Selecione uma especialidade ou convênio para começar.",
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.textPrimary,
                                  height: 1.45
                                )
                          )
                        )
                      ]
                    )
                  ),
                  const SizedBox(height: AppDim.space3)
                ],
                AppSectionHeader(
                  title: "Resultados",
                  subtitle: hasSelectedFilter
                      ? "Toque no card para ver detalhes, avaliações e contato."
                      : "Os resultados aparecem após aplicar os filtros acima."
                ),
                if (hasSelectedFilter)
                  clinicsAsync.when(
                    data: (clinics) {
                      if (clinics.isEmpty) {
                        return _EmptySearchCard(
                          onSuggest: () => context.push("/suggest"),
                          onClear: () {
                            ref.read(selectedInsuranceIdProvider.notifier).set(null);
                            ref.read(selectedSpecialtyIdProvider.notifier).set(null);
                          }
                        );
                      }
                      return Column(
                        children: clinics
                            .map(
                              (clinic) => Padding(
                                padding: const EdgeInsets.only(bottom: AppDim.space2),
                                child: ClinicCard(
                                  clinic: clinic,
                                  onTap: () => context.push("/listing/${clinic.id}")
                                )
                              )
                            )
                            .toList()
                      );
                    },
                    loading: () => const ClinicListSkeleton(),
                    error: (error, stack) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Text(
                        "Não foi possível carregar as clínicas. Tente novamente.",
                        style: TextStyle(color: Theme.of(context).colorScheme.error)
                      )
                    )
                  )
                else
                  const SizedBox.shrink(),
                const SizedBox(height: AppDim.space2),
                OutlinedButton.icon(
                  onPressed: () => context.push("/suggest"),
                  icon: const LIcon(LucideIcons.heartHandshake, size: LucideSize.lg),
                  label: const Text("Não encontrou? Ajude outras famílias"),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(48),
                    foregroundColor: AppColors.accent,
                    side: BorderSide(color: AppColors.accent.withValues(alpha: 0.45)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDim.radiusButton))
                  )
                )
              ]
            )
          )
        ]
      )
    );
  }
}

class _EmptySearchCard extends StatelessWidget {
  final VoidCallback onSuggest;
  final VoidCallback onClear;

  const _EmptySearchCard({required this.onSuggest, required this.onClear});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDim.space2),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppDim.radiusCard),
        border: Border.all(color: AppColors.divider)
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Nenhuma clínica com esses filtros",
            style: Theme.of(context).textTheme.titleSmall
          ),
          const SizedBox(height: 8),
          Text(
            "Amplie a busca ou sugira um atendimento para a moderação avaliar.",
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilledButton(
                onPressed: onSuggest,
                child: const Text("Sugerir clínica")
              ),
              OutlinedButton(
                onPressed: onClear,
                child: const Text("Limpar filtros")
              )
            ]
          )
        ]
      )
    );
  }
}
