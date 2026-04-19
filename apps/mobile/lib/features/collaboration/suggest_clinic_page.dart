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

const _kAtClinic = "at_clinic";
const _kOwnOffice = "own_office";
const _kOtherLocation = "other_location";

String _professionalAttendanceHint(String mode) {
  switch (mode) {
    case _kAtClinic:
      return "Sem endereço completo do profissional; indique a clínica abaixo se souber.";
    case _kOwnOffice:
      return "Pode informar endereço completo abaixo (opcional).";
    case _kOtherLocation:
      return "Endereço completo opcional, se quiser indicar onde costuma atender.";
    default:
      return "";
  }
}

class SuggestClinicPage extends ConsumerStatefulWidget {
  const SuggestClinicPage({super.key});

  @override
  ConsumerState<SuggestClinicPage> createState() => _SuggestClinicPageState();
}

class _SuggestClinicPageState extends ConsumerState<SuggestClinicPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _crmController = TextEditingController();
  final _linkedClinicController = TextEditingController();
  final _cityController = TextEditingController();
  final _neighborhoodController = TextEditingController();
  final _addressController = TextEditingController();
  final _phoneController = TextEditingController();
  final _whatsappController = TextEditingController();
  final _specialtiesController = TextEditingController();
  final _insurancesController = TextEditingController();
  final _observationsController = TextEditingController();
  String _targetType = "clinica";
  String _professionalAttendance = _kAtClinic;
  bool _loading = false;

  bool get _showProfessionalAddress =>
      _targetType == "profissional" &&
      (_professionalAttendance == _kOwnOffice || _professionalAttendance == _kOtherLocation);

  @override
  void dispose() {
    _nameController.dispose();
    _crmController.dispose();
    _linkedClinicController.dispose();
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

    final isProf = _targetType == "profissional";
    final includeAddress = _targetType == "clinica" || _showProfessionalAddress;
    final addressLine =
        includeAddress && _addressController.text.trim().isNotEmpty ? _addressController.text.trim() : null;

    setState(() => _loading = true);
    try {
      await ref.read(collaborationApiProvider).suggest(
            targetType: _targetType,
            name: _nameController.text.trim(),
            city: _cityController.text.trim(),
            neighborhood: _neighborhoodController.text.trim().isEmpty
                ? null
                : _neighborhoodController.text.trim(),
            addressLine: addressLine,
            professionalAttendance: isProf ? _professionalAttendance : null,
            linkedClinicName: isProf && _professionalAttendance == _kAtClinic
                ? (_linkedClinicController.text.trim().isEmpty ? null : _linkedClinicController.text.trim())
                : null,
            professionalCrm: isProf && _crmController.text.trim().isNotEmpty ? _crmController.text.trim() : null,
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
              subtitle: "Indique se é um local (clínica) ou um profissional."
            ),
            DropdownButtonFormField<String>(
              initialValue: _targetType,
              decoration: const InputDecoration(labelText: "Tipo"),
              items: const [
                DropdownMenuItem(value: "clinica", child: Text("Clínica")),
                DropdownMenuItem(value: "profissional", child: Text("Profissional"))
              ],
              onChanged: (value) {
                setState(() {
                  _targetType = value ?? "clinica";
                  if (_targetType == "clinica") {
                    _professionalAttendance = _kAtClinic;
                  }
                });
              }
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
            if (_targetType == "profissional") ...[
              const SizedBox(height: 12),
              TextFormField(
                controller: _crmController,
                decoration: const InputDecoration(
                  labelText: "CRM ou registro (opcional)",
                  hintText: "Ex.: CRM-SP 123456"
                ),
                maxLength: 80
              )
            ],
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
            if (_targetType == "profissional") ...[
              const SizedBox(height: AppDim.space3),
              const AppSectionHeader(
                title: "Onde atende?",
                subtitle: "Define se pedimos endereço completo."
              ),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment<String>(
                    value: _kAtClinic,
                    label: Text("Clínica"),
                    tooltip: "Em clínica ou consultório de terceiros"
                  ),
                  ButtonSegment<String>(
                    value: _kOwnOffice,
                    label: Text("Próprio"),
                    tooltip: "Consultório próprio"
                  ),
                  ButtonSegment<String>(
                    value: _kOtherLocation,
                    label: Text("Outro"),
                    tooltip: "Outro local ou sem vínculo fixo"
                  )
                ],
                selected: {_professionalAttendance},
                emptySelectionAllowed: false,
                multiSelectionEnabled: false,
                onSelectionChanged: (Set<String> next) {
                  if (next.isEmpty) return;
                  setState(() => _professionalAttendance = next.first);
                }
              ),
              const SizedBox(height: 10),
              Text(
                _professionalAttendanceHint(_professionalAttendance),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                      height: 1.35
                    )
              ),
              if (_professionalAttendance == _kAtClinic) ...[
                const SizedBox(height: 8),
                TextFormField(
                  controller: _linkedClinicController,
                  decoration: const InputDecoration(
                    labelText: "Nome da clínica ou centro (opcional)",
                    hintText: "Ex.: Clínica Esperança"
                  ),
                  maxLength: 200
                )
              ]
            ],
            const SizedBox(height: AppDim.space3),
            const AppSectionHeader(
              title: "Localização",
              subtitle: "Cidade obrigatória; bairro e endereço conforme o tipo acima."
            ),
            TextFormField(
              controller: _cityController,
              decoration: const InputDecoration(labelText: "Cidade"),
              textCapitalization: TextCapitalization.words,
              validator: (value) => (value == null || value.trim().isEmpty) ? "Informe a cidade." : null
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _neighborhoodController,
              decoration: const InputDecoration(labelText: "Bairro (opcional)")
            ),
            if (_targetType == "clinica" || _showProfessionalAddress) ...[
              const SizedBox(height: 12),
              TextFormField(
                controller: _addressController,
                decoration: InputDecoration(
                  labelText: _targetType == "clinica" ? "Endereço (rua e número)" : "Endereço completo (opcional)",
                  hintText: _targetType == "clinica"
                      ? "Ajuda no mapa e na busca"
                      : "Opcional; ajuda na verificação ou no mapa"
                ),
                textCapitalization: TextCapitalization.sentences
              )
            ],
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
