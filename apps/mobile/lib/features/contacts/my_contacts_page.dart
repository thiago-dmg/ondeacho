import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "contacts_provider.dart";

class MyContactsPage extends ConsumerWidget {
  const MyContactsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contactsAsync = ref.watch(myContactsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text("Meus pré-contatos")),
      body: contactsAsync.when(
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text("Nenhum pré-contato enviado."));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemBuilder: (context, index) {
              final item = items[index];
              return ListTile(
                tileColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                title: Text(item.clinicName),
                subtitle: Text(
                  "Canal: ${item.preferredChannel}${item.message == null ? "" : "\n${item.message}"}"
                )
              );
            },
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemCount: items.length
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text("Erro ao carregar contatos: $error"))
      )
    );
  }
}
