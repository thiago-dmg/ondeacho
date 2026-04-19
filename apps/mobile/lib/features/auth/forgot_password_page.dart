import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "../../core/theme/app_dimensions.dart";
import "auth_state.dart";

class ForgotPasswordPage extends ConsumerStatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  ConsumerState<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends ConsumerState<ForgotPasswordPage> {
  final _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authStateProvider);
    return Scaffold(
      appBar: AppBar(title: const Text("Esqueci a senha")),
      body: ListView(
        padding: const EdgeInsets.all(AppDim.space2),
        children: [
          Text(
            "Indique o e-mail da conta. Se existir cadastro, enviaremos um link (válido por 1 hora). "
            "O mesmo fluxo funciona na web.",
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Theme.of(context).hintColor)
          ),
          const SizedBox(height: AppDim.space2),
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(labelText: "E-mail"),
            autofillHints: const [AutofillHints.email]
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: auth.loading
                ? null
                : () async {
                    ref.read(authStateProvider.notifier).clearError();
                    final ok = await ref
                        .read(authStateProvider.notifier)
                        .requestPasswordReset(_emailController.text);
                    if (!context.mounted) {
                      return;
                    }
                    if (ok) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            "Se existir conta com este e-mail, verifique a caixa de entrada (e spam)."
                          )
                        )
                      );
                      context.pop();
                    } else {
                      final err = ref.read(authStateProvider).error;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(err ?? "Falha ao enviar."))
                      );
                    }
                  },
            child: Text(auth.loading ? "A enviar..." : "Enviar link")
          ),
          TextButton(
            onPressed: () => context.pop(),
            child: const Text("Voltar")
          )
        ]
      )
    );
  }
}
