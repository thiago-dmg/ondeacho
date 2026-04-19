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
  late final TextEditingController _currentPwController;
  late final TextEditingController _newPwController;
  late final TextEditingController _deletePwController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _currentPwController = TextEditingController();
    _newPwController = TextEditingController();
    _deletePwController = TextEditingController();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final name = ref.read(authStateProvider).profile?.name;
    if (name != null && name.isNotEmpty && _nameController.text.trim().isEmpty) {
      _nameController.text = name;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _currentPwController.dispose();
    _newPwController.dispose();
    _deletePwController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authStateProvider);
    final profile = auth.profile;

    ref.listen<AuthState>(authStateProvider, (previous, next) {
      final n = next.profile?.name;
      if (n == null || n.isEmpty) {
        return;
      }
      if (_nameController.text.trim().isEmpty) {
        _nameController.text = n;
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
            ),
            const SizedBox(height: 12),
            TextButton.icon(
              onPressed: () => context.push("/support"),
              icon: const LIcon(LucideIcons.helpCircle, size: LucideSize.body),
              label: const Text("Suporte")
            ),
            const SizedBox(height: AppDim.space3),
            Text(
              "Alterar senha",
              style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _currentPwController,
              obscureText: true,
              decoration: const InputDecoration(labelText: "Senha atual"),
              autofillHints: const [AutofillHints.password]
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _newPwController,
              obscureText: true,
              decoration: const InputDecoration(labelText: "Nova senha (mín. 8)"),
              autofillHints: const [AutofillHints.newPassword]
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: auth.loading
                  ? null
                  : () async {
                      if (_newPwController.text.length < 8) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("A nova senha deve ter pelo menos 8 caracteres."))
                        );
                        return;
                      }
                      final ok = await ref.read(authStateProvider.notifier).changePassword(
                            currentPassword: _currentPwController.text,
                            newPassword: _newPwController.text
                          );
                      if (!context.mounted) {
                        return;
                      }
                      if (ok) {
                        _currentPwController.clear();
                        _newPwController.clear();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Senha atualizada."))
                        );
                      } else {
                        final err = ref.read(authStateProvider).error;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(err ?? "Não foi possível alterar."))
                        );
                      }
                    },
              child: const Text("Atualizar senha")
            ),
            const SizedBox(height: AppDim.space3),
            Text(
              "Encerrar conta",
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: Theme.of(context).colorScheme.error
                  )
            ),
            const SizedBox(height: 8),
            Text(
              "Exclui permanentemente o seu utilizador. Confirme com a senha atual.",
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _deletePwController,
              obscureText: true,
              decoration: const InputDecoration(labelText: "Senha para confirmar exclusão")
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              style: OutlinedButton.styleFrom(
                foregroundColor: Theme.of(context).colorScheme.error,
                side: BorderSide(color: Theme.of(context).colorScheme.error.withValues(alpha: 0.5))
              ),
              onPressed: auth.loading
                  ? null
                  : () async {
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          title: const Text("Excluir conta?"),
                          content: const Text("Esta ação não pode ser desfeita."),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Cancelar")),
                            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text("Excluir"))
                          ]
                        )
                      );
                      if (confirm != true || !context.mounted) {
                        return;
                      }
                      final ok = await ref
                          .read(authStateProvider.notifier)
                          .deleteAccount(_deletePwController.text);
                      if (!context.mounted) {
                        return;
                      }
                      if (ok) {
                        context.go("/discovery");
                      } else {
                        final err = ref.read(authStateProvider).error;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(err ?? "Não foi possível excluir."))
                        );
                      }
                    },
              child: const Text("Excluir minha conta")
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
