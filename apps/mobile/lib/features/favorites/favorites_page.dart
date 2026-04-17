import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "package:lucide_icons/lucide_icons.dart";
import "../../core/theme/app_colors.dart";
import "../../core/widgets/lucide_icon.dart";
import "../../core/theme/app_dimensions.dart";
import "favorites_provider.dart";

class FavoritesPage extends ConsumerStatefulWidget {
  const FavoritesPage({super.key});

  @override
  ConsumerState<FavoritesPage> createState() => _FavoritesPageState();
}

class _FavoritesPageState extends ConsumerState<FavoritesPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(favoritesProvider.notifier).load());
  }

  @override
  Widget build(BuildContext context) {
    final favoritesAsync = ref.watch(favoritesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text("Favoritos")),
      body: favoritesAsync.when(
        data: (items) {
          if (items.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const LIcon(LucideIcons.heartOff, size: 48, color: AppColors.neutral),
                    const SizedBox(height: 16),
                    Text(
                      "Nenhuma clínica salva ainda",
                      style: Theme.of(context).textTheme.titleMedium,
                      textAlign: TextAlign.center
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Toque no coração na ficha da clínica para guardar aqui e acessar rápido depois.",
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
                      textAlign: TextAlign.center
                    )
                  ]
                )
              )
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppDim.space2),
            itemBuilder: (context, index) {
              final favorite = items[index];
              return Material(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(AppDim.radiusCard),
                child: InkWell(
                  borderRadius: BorderRadius.circular(AppDim.radiusCard),
                  onTap: () => context.push("/listing/${favorite.clinicId}"),
                  child: Ink(
                    decoration: BoxDecoration(
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
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  favorite.clinicName,
                                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                        fontWeight: FontWeight.w700
                                      ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const LIcon(LucideIcons.mapPin, size: 16, color: AppColors.textSecondary),
                                    const SizedBox(width: 4),
                                    Expanded(
                                      child: Text(
                                        favorite.city,
                                        style: Theme.of(context).textTheme.bodySmall
                                      )
                                    )
                                  ]
                                )
                              ]
                            )
                          ),
                          IconButton(
                            onPressed: () async {
                              try {
                                await ref.read(favoritesProvider.notifier).remove(favorite.clinicId);
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text("Removido dos favoritos."))
                                  );
                                }
                              } catch (error) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text("Erro ao remover: $error"))
                                  );
                                }
                              }
                            },
                            icon: const LIcon(LucideIcons.heart, color: Color(0xFFDC2626)),
                            tooltip: "Remover dos favoritos"
                          )
                        ]
                      )
                    )
                  )
                )
              );
            },
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemCount: items.length
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text("Erro ao carregar favoritos: $error"))
      )
    );
  }
}
