import "package:dio/dio.dart";
import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "../discovery/discovery_provider.dart";
import "collaboration_api.dart";

class EditOwnedClinicPage extends ConsumerStatefulWidget {
  final String clinicId;
  final String clinicName;
  final String? addressLine;
  final String? phone;
  final String? whatsappPhone;

  const EditOwnedClinicPage({
    super.key,
    required this.clinicId,
    required this.clinicName,
    this.addressLine,
    this.phone,
    this.whatsappPhone
  });

  @override
  ConsumerState<EditOwnedClinicPage> createState() => _EditOwnedClinicPageState();
}

class _EditOwnedClinicPageState extends ConsumerState<EditOwnedClinicPage> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _addressController;
  late final TextEditingController _phoneController;
  late final TextEditingController _whatsappController;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.clinicName);
    _addressController = TextEditingController(text: widget.addressLine ?? "");
    _phoneController = TextEditingController(text: widget.phone ?? "");
    _whatsappController = TextEditingController(text: widget.whatsappPhone ?? "");
  }

  @override
  void dispose() {
    _nameController.dispose();
    _addressController.dispose();
    _phoneController.dispose();
    _whatsappController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await ref.read(collaborationApiProvider).updateOwnedClinic(
            clinicId: widget.clinicId,
            name: _nameController.text.trim(),
            addressLine: _addressController.text.trim(),
            phone: _phoneController.text.trim(),
            whatsappPhone: _whatsappController.text.trim()
          );

      ref.invalidate(clinicDetailProvider(widget.clinicId));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Dados da clínica atualizados com sucesso."))
      );
      context.pop();
    } on DioException catch (error) {
      if (!mounted) return;
      final message = error.response?.statusCode == 403
          ? "Sua conta não tem permissão para editar esta clínica."
          : "Não foi possível salvar as alterações.";
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Editar clínica")),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: "Nome da clínica"),
              validator: (value) =>
                  (value == null || value.trim().isEmpty) ? "Informe o nome." : null
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(labelText: "Endereço")
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: "Telefone")
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _whatsappController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: "WhatsApp")
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _loading ? null : _save,
              child: Text(_loading ? "Salvando..." : "Salvar alterações")
            )
          ]
        )
      )
    );
  }
}
