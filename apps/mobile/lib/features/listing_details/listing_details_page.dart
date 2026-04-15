import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "../auth/auth_state.dart";
import "../contacts/contacts_provider.dart";
import "../discovery/discovery_provider.dart";
import "../favorites/favorites_provider.dart";

class ListingDetailsPage extends ConsumerWidget {
  final String listingId;

  const ListingDetailsPage({super.key, required this.listingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoggedIn = ref.watch(authStateProvider).token != null;
    final messageController = TextEditingController();
    final channel = ValueNotifier<String>("whatsapp");

    Future<void> openContactDialog() async {
      if (!isLoggedIn) {
        context.push("/login?from=%2Flisting%2F$listingId");
        return;
      }
      await showDialog<void>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text("Pré-contato"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
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
                    if (next != null) channel.value = next;
                  }
                )
              ),
              const SizedBox(height: 12),
              TextField(
                controller: messageController,
                maxLines: 3,
                decoration: const InputDecoration(labelText: "Mensagem (opcional)")
              )
            ]
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text("Cancelar")
            ),
            FilledButton(
              onPressed: () async {
                await ref.read(contactsProvider.notifier).send(
                      clinicId: listingId,
                      preferredChannel: channel.value,
                      message: messageController.text
                    );
                if (dialogContext.mounted) {
                  Navigator.of(dialogContext).pop();
                }
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Interesse enviado com sucesso."))
                  );
                }
              },
              child: const Text("Enviar")
            )
          ]
        )
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text("Detalhes do atendimento")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ref.watch(clinicDetailProvider(listingId)).when(
              data: (clinic) => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(clinic.name, style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 6),
                  Text(clinic.city, style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: 6),
                  Text("Nota ${clinic.rating.toStringAsFixed(1)}"),
                  if (clinic.description != null && clinic.description!.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(clinic.description!)
                  ],
                  const SizedBox(height: 16),
                  FilledButton.icon(
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
                    },
                    icon: const Icon(Icons.favorite),
                    label: const Text("Adicionar aos favoritos")
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: openContactDialog,
                    icon: const Icon(Icons.send),
                    label: const Text("Enviar pré-contato")
                  )
                ]
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => Center(child: Text("Erro ao carregar detalhes: $error"))
            )
      )
    );
  }
}
