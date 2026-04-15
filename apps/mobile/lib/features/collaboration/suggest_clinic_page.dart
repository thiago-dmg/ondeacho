import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "../auth/auth_state.dart";
import "collaboration_api.dart";

class SuggestClinicPage extends ConsumerStatefulWidget {
  const SuggestClinicPage({super.key});

  @override
  ConsumerState<SuggestClinicPage> createState() => _SuggestClinicPageState();
}

class _SuggestClinicPageState extends ConsumerState<SuggestClinicPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _cityController = TextEditingController();
  final _neighborhoodController = TextEditingController();
  final _addressController = TextEditingController();
  final _phoneController = TextEditingController();
  final _whatsappController = TextEditingController();
  final _specialtiesController = TextEditingController();
  final _insurancesController = TextEditingController();
  final _observationsController = TextEditingController();
  String _targetType = "clinica";
  bool _loading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _cityController.dispose();
    _neighborhoodController.dispose();
    _addressController.dispose();
    _phoneController.dispose();
    _whatsappController.dispose();
    _specialtiesController.dispose();
    _insurancesController.dispose();
    _observationsController.dispose();
    super.dispose();
  }

  List<String> _parseList(String value) {
    return value
        .split(",")
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final isLoggedIn = ref.read(authStateProvider).token != null;
    if (!isLoggedIn) {
      if (!mounted) return;
      context.push("/login?from=%2Fsuggest");
      return;
    }

    setState(() => _loading = true);
    try {
      await ref.read(collaborationApiProvider).suggest(
            targetType: _targetType,
            name: _nameController.text.trim(),
            city: _cityController.text.trim(),
            neighborhood: _neighborhoodController.text.trim().isEmpty
                ? null
                : _neighborhoodController.text.trim(),
            addressLine: _addressController.text.trim().isEmpty ? null : _addressController.text.trim(),
            phone: _phoneController.text.trim().isEmpty ? null : _phoneController.text.trim(),
            whatsappPhone: _whatsappController.text.trim().isEmpty ? null : _whatsappController.text.trim(),
            specialtyNames: _parseList(_specialtiesController.text),
            insuranceNames: _parseList(_insurancesController.text),
            observations: _observationsController.text.trim().isEmpty
                ? null
                : _observationsController.text.trim()
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Sugestão enviada para moderação. Obrigado!"))
      );
      context.pop();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Falha ao enviar sugestão: $error"))
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Sugerir atendimento")),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            DropdownButtonFormField<String>(
              initialValue: _targetType,
              decoration: const InputDecoration(labelText: "Tipo"),
              items: const [
                DropdownMenuItem(value: "clinica", child: Text("Clínica")),
                DropdownMenuItem(value: "profissional", child: Text("Profissional"))
              ],
              onChanged: (value) => setState(() => _targetType = value ?? "clinica")
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: "Nome"),
              validator: (value) => (value == null || value.trim().isEmpty) ? "Informe o nome." : null
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _cityController,
              decoration: const InputDecoration(labelText: "Cidade"),
              validator: (value) => (value == null || value.trim().isEmpty) ? "Informe a cidade." : null
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _neighborhoodController,
              decoration: const InputDecoration(labelText: "Bairro")
            ),
            const SizedBox(height: 12),
            TextFormField(controller: _addressController, decoration: const InputDecoration(labelText: "Endereço")),
            const SizedBox(height: 12),
            TextFormField(controller: _phoneController, decoration: const InputDecoration(labelText: "Telefone")),
            const SizedBox(height: 12),
            TextFormField(
              controller: _whatsappController,
              decoration: const InputDecoration(labelText: "WhatsApp")
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _specialtiesController,
              decoration: const InputDecoration(labelText: "Especialidades (separe por vírgula)")
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _insurancesController,
              decoration: const InputDecoration(labelText: "Convênios (separe por vírgula)")
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _observationsController,
              maxLines: 3,
              decoration: const InputDecoration(labelText: "Observações")
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _loading ? null : _submit,
              child: Text(_loading ? "Enviando..." : "Enviar sugestão")
            )
          ]
        )
      )
    );
  }
}
