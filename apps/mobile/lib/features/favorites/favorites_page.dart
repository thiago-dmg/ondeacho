import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
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
            return const Center(child: Text("Nenhuma clínica favoritada."));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemBuilder: (context, index) {
              final favorite = items[index];
              return ListTile(
                tileColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                title: Text(favorite.clinicName),
                subtitle: Text(favorite.city),
                trailing: IconButton(
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
                  icon: const Icon(Icons.favorite, color: Colors.red)
                )
              );
            },
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemCount: items.length
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text("Erro ao carregar favoritos: $error"))
      )
    );
  }
}
