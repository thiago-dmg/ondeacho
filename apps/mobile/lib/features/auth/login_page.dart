import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "../../core/routing/auth_redirect.dart";
import "../../core/theme/app_colors.dart";
import "../../core/theme/app_dimensions.dart";
import "auth_state.dart";

class LoginPage extends ConsumerStatefulWidget {
  /// Abre direto no fluxo de cadastro (rota `/register` ou `?register=1`).
  final bool startInRegisterMode;

  const LoginPage({super.key, this.startInRegisterMode = false});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  late bool _registerMode;

  @override
  void initState() {
    super.initState();
    _registerMode = widget.startInRegisterMode;
  }

  @override
  void didUpdateWidget(covariant LoginPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.startInRegisterMode != widget.startInRegisterMode) {
      _registerMode = widget.startInRegisterMode;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  /// Após **cadastro** ou **login**, home por padrão; `?from=` só quando não é o atalho do ícone de conta (`/profile`).
  void _goAfterSuccess({required bool wasRegister}) {
    final from = GoRouterState.of(context).uri.queryParameters["from"];
    context.go(postAuthLocation(fromQuery: from, wasRegister: wasRegister));
  }

  Uri _registerUri() {
    final from = GoRouterState.of(context).uri.queryParameters["from"];
    if (from != null && from.isNotEmpty) {
      return Uri(path: "/register", queryParameters: {"from": from});
    }
    return Uri(path: "/register");
  }

  Uri _loginUri() {
    final from = GoRouterState.of(context).uri.queryParameters["from"];
    if (from != null && from.isNotEmpty) {
      return Uri(path: "/login", queryParameters: {"from": from});
    }
    return Uri(path: "/login");
  }

  Future<void> _submit() async {
    ref.read(authStateProvider.notifier).clearError();
    if (_registerMode) {
      final name = _nameController.text.trim();
      if (name.length < 2) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Informe seu nome (pelo menos 2 letras)."))
        );
        return;
      }
      if (_passwordController.text.length < 8) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("A senha deve ter pelo menos 8 caracteres."))
        );
        return;
      }
    }
    final notifier = ref.read(authStateProvider.notifier);
    final wasRegister = _registerMode;
    final bool success;
    if (_registerMode) {
      success = await notifier.register(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text
      );
    } else {
      success = await notifier.login(
        email: _emailController.text.trim(),
        password: _passwordController.text
      );
    }
    if (!mounted) return;
    if (success) {
      _goAfterSuccess(wasRegister: wasRegister);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    return Scaffold(
      appBar: AppBar(
        title: Text(_registerMode ? "Criar conta" : "Entrar")
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppDim.space2),
        children: [
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
                  "OndeAcho",
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w800
                      )
                ),
                const SizedBox(height: 8),
                Text(
                  "Acesso seguro para favoritar, avaliar e registrar contato com clínicas.",
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)
                )
              ]
            )
          ),
          const SizedBox(height: AppDim.space3),
          if (_registerMode) ...[
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: "Nome completo"),
              textCapitalization: TextCapitalization.words,
              autofillHints: const [AutofillHints.name]
            ),
            const SizedBox(height: 12)
          ],
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(labelText: "E-mail"),
            autofillHints: const [AutofillHints.email]
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _passwordController,
            obscureText: true,
            decoration: InputDecoration(
              labelText: "Senha",
              helperText: _registerMode ? "Mínimo de 8 caracteres" : null
            ),
            autofillHints: _registerMode
                ? const [AutofillHints.newPassword]
                : const [AutofillHints.password]
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: authState.loading ? null : _submit,
            child: Text(
              authState.loading
                  ? (_registerMode ? "Criando conta..." : "Entrando...")
                  : (_registerMode ? "Criar conta" : "Entrar")
            )
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: authState.loading
                ? null
                : () {
                    ref.read(authStateProvider.notifier).clearError();
                    if (_registerMode) {
                      context.go(_loginUri().toString());
                    } else {
                      context.push(_registerUri().toString());
                    }
                  },
            child: Text(
              _registerMode ? "Já tenho conta — entrar" : "Não tenho conta — criar conta"
            )
          ),
          if (authState.error != null) ...[
            const SizedBox(height: 12),
            Text(
              authState.error!,
              style: TextStyle(color: Theme.of(context).colorScheme.error)
            )
          ]
        ]
      )
    );
  }
}
