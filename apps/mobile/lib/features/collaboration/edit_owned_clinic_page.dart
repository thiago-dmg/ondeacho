import "package:dio/dio.dart";
import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "../discovery/discovery_provider.dart";
import "collaboration_api.dart";

class EditOwnedClinicPage extends ConsumerStatefulWidget {
  final String clinicId;

  const EditOwnedClinicPage({super.key, required this.clinicId});

  @override
  ConsumerState<EditOwnedClinicPage> createState() => _EditOwnedClinicPageState();
}

class _EditOwnedClinicPageState extends ConsumerState<EditOwnedClinicPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  final _phoneController = TextEditingController();
  final _whatsappController = TextEditingController();
  final _websiteController = TextEditingController();
  final _instagramController = TextEditingController();
  final _facebookController = TextEditingController();
  bool _loading = false;
  bool _ownerCheckPending = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadClinicAndVerifyOwner());
  }

  Future<void> _loadClinicAndVerifyOwner() async {
    try {
      ref.invalidate(clinicDetailProvider(widget.clinicId));
      final clinic = await ref.read(clinicDetailProvider(widget.clinicId).future);
      if (!mounted) {
        return;
      }
      if (!clinic.viewerIsOwner) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Sua conta não tem permissão para editar esta clínica."))
        );
        context.pop();
        return;
      }
      _nameController.text = clinic.name;
      _addressController.text = clinic.addressLine ?? "";
      _phoneController.text = clinic.phone ?? "";
      _whatsappController.text = clinic.whatsappPhone ?? "";
      _websiteController.text = clinic.websiteUrl ?? "";
      _instagramController.text = clinic.instagramUrl ?? "";
      _facebookController.text = clinic.facebookUrl ?? "";
    } catch (_) {
      if (mounted) {
        context.pop();
      }
      return;
    }
    if (mounted) {
      setState(() => _ownerCheckPending = false);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _addressController.dispose();
    _phoneController.dispose();
    _whatsappController.dispose();
    _websiteController.dispose();
    _instagramController.dispose();
    _facebookController.dispose();
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
            whatsappPhone: _whatsappController.text.trim(),
            websiteUrl: _websiteController.text.trim(),
            instagramUrl: _instagramController.text.trim(),
            facebookUrl: _facebookController.text.trim()
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
    if (_ownerCheckPending) {
      return Scaffold(
        appBar: AppBar(title: const Text("Editar clínica")),
        body: const Center(child: CircularProgressIndicator())
      );
    }
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
            const SizedBox(height: 12),
            TextFormField(
              controller: _websiteController,
              keyboardType: TextInputType.url,
              decoration: const InputDecoration(
                labelText: "Site (URL)",
                hintText: "https://…"
              )
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _instagramController,
              decoration: const InputDecoration(
                labelText: "Instagram (URL ou @perfil)",
                hintText: "@sua_clinica"
              )
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _facebookController,
              decoration: const InputDecoration(
                labelText: "Facebook (URL ou nome da página)",
                hintText: "https://facebook.com/…"
              )
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
