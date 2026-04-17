import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "package:lucide_icons/lucide_icons.dart";
import "../../core/theme/app_colors.dart";
import "../../core/theme/app_dimensions.dart";
import "../../core/widgets/lucide_icon.dart";
import "contacts_provider.dart";

class MyContactsPage extends ConsumerWidget {
  const MyContactsPage({super.key});

  static String _dateLine(DateTime? at) {
    if (at == null) {
      return "";
    }
    final d = at.toLocal();
    String two(int n) => n.toString().padLeft(2, "0");
    return "${two(d.day)}/${two(d.month)}/${d.year} às ${two(d.hour)}:${two(d.minute)}";
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contactsAsync = ref.watch(myContactsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text("Contatos enviados")),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(myContactsProvider);
          await ref.read(myContactsProvider.future);
        },
        child: contactsAsync.when(
          data: (items) {
            if (items.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(AppDim.space2),
                children: [
                  Text(
                    "Aqui ficam os pedidos de contato que você enviou pela ficha da clínica (botão “Contato”). "
                    "Favoritos são só um atalho para voltar na clínica — não enviam mensagem.",
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.45)
                  ),
                  const SizedBox(height: 24),
                  Center(
                    child: Text(
                      "Você ainda não enviou nenhum contato.",
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
                      textAlign: TextAlign.center
                    )
                  )
                ]
              );
            }
            return ListView(
              padding: const EdgeInsets.all(AppDim.space2),
              children: [
                Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Text(
                    "Histórico do botão “Contato” nas fichas. Toque na linha para abrir a clínica.",
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.45)
                  )
                ),
                ...items.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      tileColor: AppColors.card,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppDim.radiusCard),
                        side: const BorderSide(color: AppColors.divider)
                      ),
                      leading: const LIcon(LucideIcons.send, color: AppColors.primary),
                      title: Text(item.clinicName),
                      subtitle: Text(
                        "Canal: ${contactChannelLabel(item.preferredChannel)}"
                        "${item.createdAt != null ? "\nEnviado em ${_dateLine(item.createdAt)}" : ""}"
                        "${item.message == null || item.message!.trim().isEmpty ? "" : "\n${item.message}"}"
                      ),
                      isThreeLine: true,
                      trailing: const LIcon(LucideIcons.chevronRight, color: AppColors.textSecondary),
                      onTap: item.clinicId.isEmpty
                          ? null
                          : () => context.push("/listing/${item.clinicId}")
                    )
                  )
                )
              ]
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(AppDim.space2),
            children: [
              Text(
                "Erro ao carregar: $error",
                style: TextStyle(color: Theme.of(context).colorScheme.error)
              )
            ]
          )
        )
      )
    );
  }
}
