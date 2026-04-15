import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "../auth/auth_state.dart";
import "collaboration_api.dart";

class ProfileClaimPage extends ConsumerStatefulWidget {
  final String clinicId;
  final String clinicName;

  const ProfileClaimPage({super.key, required this.clinicId, required this.clinicName});

  @override
  ConsumerState<ProfileClaimPage> createState() => _ProfileClaimPageState();
}

class _ProfileClaimPageState extends ConsumerState<ProfileClaimPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _messageController = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final isLoggedIn = ref.read(authStateProvider).token != null;
    if (!isLoggedIn) {
      if (!mounted) return;
      context.push("/login?from=%2Flisting%2F${widget.clinicId}");
      return;
    }
    setState(() => _loading = true);
    try {
      await ref.read(collaborationApiProvider).claimProfile(
            clinicId: widget.clinicId,
            requesterName: _nameController.text.trim(),
            requesterEmail: _emailController.text.trim(),
            requesterPhone: _phoneController.text.trim(),
            message: _messageController.text.trim().isEmpty ? null : _messageController.text.trim()
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Solicitação enviada para análise do admin."))
      );
      context.pop();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Falha ao enviar reivindicação: $error"))
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Reivindicar perfil")),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text("Perfil: ${widget.clinicName}", style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: "Seu nome"),
              validator: (value) => (value == null || value.trim().isEmpty) ? "Informe seu nome." : null
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: "Seu e-mail"),
              validator: (value) => (value == null || value.trim().isEmpty) ? "Informe seu e-mail." : null
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: "Seu telefone"),
              validator: (value) => (value == null || value.trim().isEmpty) ? "Informe seu telefone." : null
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _messageController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: "Mensagem",
                hintText: "Explique por que você representa este perfil."
              )
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _loading ? null : _submit,
              child: Text(_loading ? "Enviando..." : "Enviar reivindicação")
            )
          ]
        )
      )
    );
  }
}
