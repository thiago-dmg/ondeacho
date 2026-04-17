import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "package:lucide_icons/lucide_icons.dart";
import "../../core/theme/app_colors.dart";
import "../../core/widgets/lucide_icon.dart";
import "../../core/theme/app_dimensions.dart";
import "../../core/widgets/app_section_header.dart";
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
          padding: const EdgeInsets.all(AppDim.space2),
          children: [
            Container(
              padding: const EdgeInsets.all(AppDim.space2),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(AppDim.radiusCard),
                border: Border.all(color: AppColors.divider),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.shadow,
                    blurRadius: 8,
                    offset: const Offset(0, 2)
                  )
                ]
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const LIcon(LucideIcons.heartHandshake, color: AppColors.primary, size: 28),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          "Ajude outras famílias",
                          style: Theme.of(context).textTheme.titleMedium
                        )
                      )
                    ]
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Cada sugestão passa por revisão antes de entrar na busca. Quanto mais completo o formulário, mais rápido conseguimos validar.",
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                          height: 1.45
                        )
                  )
                ]
              )
            ),
            const SizedBox(height: AppDim.space3),
            const AppSectionHeader(
              title: "Tipo de cadastro",
              subtitle: "Indique se é um local (clínica) ou um profissional autônomo."
            ),
            DropdownButtonFormField<String>(
              initialValue: _targetType,
              decoration: const InputDecoration(labelText: "Tipo"),
              items: const [
                DropdownMenuItem(value: "clinica", child: Text("Clínica")),
                DropdownMenuItem(value: "profissional", child: Text("Profissional"))
              ],
              onChanged: (value) => setState(() => _targetType = value ?? "clinica")
            ),
            const SizedBox(height: AppDim.space3),
            const AppSectionHeader(
              title: "Dados básicos",
              subtitle: "Nome e cidade são obrigatórios."
            ),
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: "Nome"),
              textCapitalization: TextCapitalization.words,
              validator: (value) => (value == null || value.trim().isEmpty) ? "Informe o nome." : null
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _cityController,
              decoration: const InputDecoration(labelText: "Cidade"),
              textCapitalization: TextCapitalization.words,
              validator: (value) => (value == null || value.trim().isEmpty) ? "Informe a cidade." : null
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _neighborhoodController,
              decoration: const InputDecoration(labelText: "Bairro")
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(labelText: "Endereço"),
              textCapitalization: TextCapitalization.sentences
            ),
            const SizedBox(height: AppDim.space3),
            const AppSectionHeader(
              title: "Contato",
              subtitle: "Opcional, mas ajuda na verificação."
            ),
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
            const SizedBox(height: AppDim.space3),
            const AppSectionHeader(
              title: "Informações médicas",
              subtitle: "Separe especialidades e convênios por vírgula."
            ),
            TextFormField(
              controller: _specialtiesController,
              decoration: const InputDecoration(
                labelText: "Especialidades",
                hintText: "Ex.: Fonoaudiologia, Psicologia infantil"
              )
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _insurancesController,
              decoration: const InputDecoration(
                labelText: "Convênios",
                hintText: "Ex.: Unimed, Bradesco Saúde"
              )
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _observationsController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: "Observações",
                alignLabelWithHint: true
              )
            ),
            const SizedBox(height: AppDim.space3),
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
