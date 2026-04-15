import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "package:url_launcher/url_launcher.dart";
import "../auth/auth_state.dart";
import "../contacts/contacts_provider.dart";
import "../discovery/discovery_provider.dart";
import "../favorites/favorites_provider.dart";

class ListingDetailsPage extends ConsumerWidget {
  final String listingId;

  const ListingDetailsPage({super.key, required this.listingId});

  String _buildAddress({
    required String city,
    String? addressLine,
    String? addressNumber,
    String? neighborhood,
    String? zipcode
  }) {
    final street = [addressLine, addressNumber].where((value) => value != null && value.isNotEmpty).join(", ");
    final locationParts = [neighborhood, city].where((value) => value != null && value.isNotEmpty).join(" - ");
    final primary = [street, locationParts].where((value) => value.isNotEmpty).join(" • ");
    if (primary.isEmpty) return city;
    if (zipcode != null && zipcode.isNotEmpty) return "$primary • CEP $zipcode";
    return primary;
  }

  String _digitsOnly(String value) {
    return value.replaceAll(RegExp(r"[^0-9]"), "");
  }

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

    Future<void> openExternalUri(Uri uri, {String? fallbackMessage}) async {
      final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!opened && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(fallbackMessage ?? "Não foi possível abrir o aplicativo."))
        );
      }
    }

    return Scaffold(
      appBar: AppBar(title: const Text("Detalhes do atendimento")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ref.watch(clinicDetailProvider(listingId)).when(
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
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                  Text(clinic.name, style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      if (clinic.isVerified)
                        const Chip(
                          avatar: Icon(Icons.verified, size: 18),
                          label: Text("Perfil verificado")
                        ),
                      if (clinic.isClaimed)
                        const Chip(
                          avatar: Icon(Icons.badge_outlined, size: 18),
                          label: Text("Perfil reivindicado")
                        ),
                      if (clinic.addedByCommunity)
                        const Chip(
                          avatar: Icon(Icons.groups_outlined, size: 18),
                          label: Text("Adicionado pela comunidade")
                        )
                    ]
                  ),
                  const SizedBox(height: 6),
                  Text(clinic.city, style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: 6),
                  Text("Nota ${clinic.rating.toStringAsFixed(1)}"),
                  const SizedBox(height: 8),
                  Text("Endereço: $addressText"),
                  if ((clinic.phone?.isNotEmpty ?? false) || (clinic.whatsappPhone?.isNotEmpty ?? false)) ...[
                    const SizedBox(height: 6),
                    Text(
                      "Contato: ${clinic.phone ?? "Não informado"}"
                      "${clinic.whatsappPhone != null && clinic.whatsappPhone!.isNotEmpty ? " • WhatsApp: ${clinic.whatsappPhone}" : ""}"
                    )
                  ],
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      if (normalizedPhone.isNotEmpty)
                        OutlinedButton.icon(
                          onPressed: () async {
                            await openExternalUri(
                              Uri(scheme: "tel", path: _digitsOnly(normalizedPhone)),
                              fallbackMessage: "Não foi possível abrir o discador."
                            );
                          },
                          icon: const Icon(Icons.phone),
                          label: const Text("Ligar")
                        ),
                      if (normalizedWhatsapp.isNotEmpty)
                        OutlinedButton.icon(
                          onPressed: () async {
                            await openExternalUri(
                              Uri.parse("https://wa.me/${_digitsOnly(normalizedWhatsapp)}"),
                              fallbackMessage: "Não foi possível abrir o WhatsApp."
                            );
                          },
                          icon: const Icon(Icons.chat),
                          label: const Text("WhatsApp")
                        ),
                      OutlinedButton.icon(
                        onPressed: () async {
                          await openExternalUri(
                            Uri.parse(
                              "https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(addressText)}"
                            ),
                            fallbackMessage: "Não foi possível abrir o mapa."
                          );
                        },
                        icon: const Icon(Icons.map_outlined),
                        label: const Text("Abrir no mapa")
                      )
                    ]
                  ),
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
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: () {
                      context.push(
                        "/claim/$listingId?name=${Uri.encodeComponent(clinic.name)}"
                      );
                    },
                    child: const Text("Esse é seu negócio? Reivindicar perfil")
                  )
                ]
              );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => Center(child: Text("Erro ao carregar detalhes: $error"))
            )
      )
    );
  }
}
