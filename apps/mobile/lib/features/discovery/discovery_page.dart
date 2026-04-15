import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "../auth/auth_state.dart";
import "discovery_provider.dart";

class DiscoveryPage extends ConsumerWidget {
  const DiscoveryPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final clinicsAsync = ref.watch(clinicsProvider);
    final professionalsAsync = ref.watch(professionalsProvider);
    final specialtiesAsync = ref.watch(specialtiesProvider);
    final insurancesAsync = ref.watch(insurancesProvider);
    final selectedSpecialty = ref.watch(selectedSpecialtyIdProvider);
    final selectedInsurance = ref.watch(selectedInsuranceIdProvider);
    final isLoggedIn = ref.watch(authStateProvider).token != null;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Buscar atendimentos"),
        actions: [
          IconButton(
            onPressed: () => context.push("/suggest"),
            icon: const Icon(Icons.add_business_outlined)
          ),
          IconButton(
            onPressed: () {
              if (isLoggedIn) {
                context.push("/favorites");
                return;
              }
              context.push("/login?from=%2Ffavorites");
            },
            icon: const Icon(Icons.favorite)
          ),
          IconButton(
            onPressed: () {
              if (isLoggedIn) {
                context.push("/my-contacts");
                return;
              }
              context.push("/login?from=%2Fmy-contacts");
            },
            icon: const Icon(Icons.mail_outline)
          )
        ]
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                specialtiesAsync.when(
                  data: (items) => DropdownButtonFormField<String?>(
                    initialValue: selectedSpecialty,
                    decoration: const InputDecoration(labelText: "Especialidade"),
                    items: [
                      const DropdownMenuItem(value: null, child: Text("Todas")),
                      ...items.map(
                        (item) => DropdownMenuItem(value: item.id, child: Text(item.name))
                      )
                    ],
                    onChanged: (value) =>
                        ref.read(selectedSpecialtyIdProvider.notifier).set(value)
                  ),
                  loading: () => const SizedBox.shrink(),
                  error: (error, stack) => const SizedBox.shrink()
                ),
                const SizedBox(height: 8),
                insurancesAsync.when(
                  data: (items) => DropdownButtonFormField<String?>(
                    initialValue: selectedInsurance,
                    decoration: const InputDecoration(labelText: "Convênio"),
                    items: [
                      const DropdownMenuItem(value: null, child: Text("Todos")),
                      ...items.map(
                        (item) => DropdownMenuItem(value: item.id, child: Text(item.name))
                      )
                    ],
                    onChanged: (value) =>
                        ref.read(selectedInsuranceIdProvider.notifier).set(value)
                  ),
                  loading: () => const SizedBox.shrink(),
                  error: (error, stack) => const SizedBox.shrink()
                )
              ]
            )
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              children: [
                Text("Clínicas", style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                clinicsAsync.when(
                  data: (clinics) => Column(
                    children: clinics
                        .map(
                          (clinic) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              tileColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              title: Text(clinic.name),
                              subtitle:
                                  Text("${clinic.city} • Nota ${clinic.rating.toStringAsFixed(1)}"),
                              onTap: () => context.push("/listing/${clinic.id}")
                            )
                          )
                        )
                        .toList()
                  ),
                  loading: () => const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: Center(child: CircularProgressIndicator())
                  ),
                  error: (error, stack) => Text("Erro ao carregar clínicas: $error")
                ),
                if ((clinicsAsync.asData?.value.isEmpty ?? false) &&
                    (professionalsAsync.asData?.value.isEmpty ?? false)) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.black12)
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("Não encontramos atendimentos nessa busca."),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            OutlinedButton(
                              onPressed: () => context.push("/suggest"),
                              child: const Text("Sugerir clínica")
                            ),
                            OutlinedButton(
                              onPressed: () {
                                ref.read(selectedInsuranceIdProvider.notifier).set(null);
                                ref.read(selectedSpecialtyIdProvider.notifier).set(null);
                              },
                              child: const Text("Ampliar raio de busca")
                            ),
                            OutlinedButton(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text("Dica: habilite o filtro de atendimento online no próximo passo.")
                                  )
                                );
                              },
                              child: const Text("Ver atendimentos online")
                            )
                          ]
                        )
                      ]
                    )
                  )
                ],
                const SizedBox(height: 12),
                Text("Profissionais", style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                professionalsAsync.when(
                  data: (professionals) => Column(
                    children: professionals
                        .map(
                          (professional) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              tileColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              title: Text(professional.name),
                              subtitle: Text(
                                "${professional.city} • Nota ${professional.rating.toStringAsFixed(1)}"
                              )
                            )
                          )
                        )
                        .toList()
                  ),
                  loading: () => const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: Center(child: CircularProgressIndicator())
                  ),
                  error: (error, stack) => Text("Erro ao carregar profissionais: $error")
                ),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton.icon(
                    onPressed: () => context.push("/suggest"),
                    icon: const Icon(Icons.lightbulb_outline),
                    label: const Text("Não encontrou? Sugerir")
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
