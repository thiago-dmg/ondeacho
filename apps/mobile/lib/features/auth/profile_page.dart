import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "package:lucide_icons/lucide_icons.dart";
import "../../core/theme/app_colors.dart";
import "../../core/theme/app_dimensions.dart";
import "../../core/widgets/lucide_icon.dart";
import "auth_state.dart";

class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  late final TextEditingController _nameController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authStateProvider);
    final profile = auth.profile;

    ref.listen<AuthState>(authStateProvider, (previous, next) {
      final name = next.profile?.name;
      if (name == null) {
        return;
      }
      if (previous?.profile?.name != next.profile?.name) {
        _nameController.text = name;
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text("Minha conta")),
      body: ListView(
        padding: const EdgeInsets.all(AppDim.space2),
        children: [
          if (profile != null) ...[
            Container(
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
                    "E-mail",
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(color: AppColors.textSecondary)
                  ),
                  const SizedBox(height: 4),
                  Text(profile.email, style: Theme.of(context).textTheme.bodyLarge),
                ]
              )
            ),
            const SizedBox(height: AppDim.space2),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const LIcon(LucideIcons.send, color: AppColors.primary),
              title: const Text("Contatos enviados"),
              subtitle: Text(
                "Histórico do botão “Contato” nas fichas — não é a mesma coisa que favoritar.",
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)
              ),
              trailing: const LIcon(LucideIcons.chevronRight, color: AppColors.textSecondary),
              onTap: () => context.push("/my-contacts")
            ),
            const SizedBox(height: AppDim.space2),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: "Nome",
                prefixIcon: LIcon(LucideIcons.user, size: LucideSize.body)
              ),
              textCapitalization: TextCapitalization.words
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: auth.loading
                  ? null
                  : () async {
                      final ok = await ref
                          .read(authStateProvider.notifier)
                          .updateProfileName(_nameController.text);
                      if (!context.mounted) return;
                      if (ok) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Nome atualizado."))
                        );
                      } else {
                        final err = ref.read(authStateProvider).error;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(err ?? "Não foi possível salvar."))
                        );
                      }
                    },
              child: Text(auth.loading ? "Salvando..." : "Salvar nome")
            )
          ] else
            const Padding(
              padding: EdgeInsets.all(24),
              child: Center(child: CircularProgressIndicator())
            ),
          const SizedBox(height: 32),
          OutlinedButton.icon(
            onPressed: auth.loading
                ? null
                : () async {
                    await ref.read(authStateProvider.notifier).logout();
                    if (context.mounted) {
                      context.go("/discovery");
                    }
                  },
            icon: const LIcon(LucideIcons.logOut),
            label: const Text("Sair da conta")
          )
        ]
      )
    );
  }
}
