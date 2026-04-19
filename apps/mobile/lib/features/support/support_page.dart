import "package:dio/dio.dart";
import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "../../core/network/api_client.dart";
import "../../core/theme/app_colors.dart";
import "../../core/theme/app_dimensions.dart";

class SupportPage extends ConsumerStatefulWidget {
  const SupportPage({super.key});

  @override
  ConsumerState<SupportPage> createState() => _SupportPageState();
}

class _SupportPageState extends ConsumerState<SupportPage> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _messageController = TextEditingController();
  bool _sending = false;
  String? _error;
  bool _sent = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    final msg = _messageController.text.trim();
    if (email.isEmpty || msg.length < 10) {
      setState(() {
        _error = "Preencha o e-mail e uma mensagem com pelo menos 10 caracteres.";
      });
      return;
    }
    setState(() {
      _sending = true;
      _error = null;
    });
    final dio = ref.read(dioProvider);
    try {
      await dio.post<void>(
        "/support/message",
        data: {
          "email": email.toLowerCase(),
          if (_nameController.text.trim().isNotEmpty) "name": _nameController.text.trim(),
          "message": msg
        }
      );
      if (!mounted) {
        return;
      }
      setState(() {
        _sent = true;
        _sending = false;
        _messageController.clear();
      });
    } on DioException catch (e) {
      if (!mounted) {
        return;
      }
      final data = e.response?.data;
      String? m;
      if (data is Map && data["message"] != null) {
        m = data["message"].toString();
      }
      setState(() {
        _sending = false;
        _error = m ?? "Não foi possível enviar. Tente mais tarde.";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Suporte")),
      body: ListView(
        padding: const EdgeInsets.all(AppDim.space2),
        children: [
          Text(
            "Envie uma mensagem à equipa. Resposta em dias úteis.",
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)
          ),
          const SizedBox(height: AppDim.space2),
          if (_sent)
            Container(
              padding: const EdgeInsets.all(AppDim.space2),
              decoration: BoxDecoration(
                color: AppColors.verifiedBg,
                borderRadius: BorderRadius.circular(AppDim.radiusCard),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.35))
              ),
              child: const Text("Mensagem enviada. Obrigado!")
            )
          else ...[
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: "Nome (opcional)"),
              textCapitalization: TextCapitalization.words
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: "E-mail para resposta"),
              autofillHints: const [AutofillHints.email]
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _messageController,
              decoration: const InputDecoration(
                labelText: "Mensagem",
                alignLabelWithHint: true
              ),
              minLines: 4,
              maxLines: 8
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error))
            ],
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _sending ? null : _submit,
              child: Text(_sending ? "A enviar..." : "Enviar")
            )
          ]
        ]
      )
    );
  }
}
