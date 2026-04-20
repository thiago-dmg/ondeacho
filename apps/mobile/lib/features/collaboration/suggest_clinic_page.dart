import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "package:lucide_icons/lucide_icons.dart";
import "../../core/theme/app_colors.dart";
import "../../core/widgets/lucide_icon.dart";
import "../../core/theme/app_dimensions.dart";
import "../../core/widgets/app_section_header.dart";
import "../auth/auth_state.dart";
import "../discovery/discovery_provider.dart";
import "collaboration_api.dart";

const String _kOther = "__other__";

class SuggestClinicPage extends ConsumerStatefulWidget {
  const SuggestClinicPage({super.key});

  @override
  ConsumerState<SuggestClinicPage> createState() => _SuggestClinicPageState();
}

class _SuggestClinicPageState extends ConsumerState<SuggestClinicPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _crmController = TextEditingController();
  final _cityController = TextEditingController();
  final _neighborhoodController = TextEditingController();
  final _addressController = TextEditingController();
  final _phoneController = TextEditingController();
  final _whatsappController = TextEditingController();
  final _specialtyOtherController = TextEditingController();
  final _insuranceOtherController = TextEditingController();
  final _observationsController = TextEditingController();
  final _draftClinicNameController = TextEditingController();
  final _draftClinicCityController = TextEditingController();
  final _draftClinicNeighborhoodController = TextEditingController();
  final _draftClinicAddressController = TextEditingController();
  final _draftClinicPhoneController = TextEditingController();
  final _draftClinicWhatsappController = TextEditingController();

  String _targetType = "clinica";
  bool _loading = false;
  final List<String> _selectedSpecialtyIds = [];
  final List<String> _selectedInsuranceIds = [];
  String _linkedClinicValue = "";

  bool get _isProf => _targetType == "profissional";
  bool get _linkedClinicOtherOn => _isProf && _linkedClinicValue == _kOther;

  @override
  void dispose() {
    _nameController.dispose();
    _crmController.dispose();
    _cityController.dispose();
    _neighborhoodController.dispose();
    _addressController.dispose();
    _phoneController.dispose();
    _whatsappController.dispose();
    _specialtyOtherController.dispose();
    _insuranceOtherController.dispose();
    _observationsController.dispose();
    _draftClinicNameController.dispose();
    _draftClinicCityController.dispose();
    _draftClinicNeighborhoodController.dispose();
    _draftClinicAddressController.dispose();
    _draftClinicPhoneController.dispose();
    _draftClinicWhatsappController.dispose();
    super.dispose();
  }

  void _toggleId(List<String> ids, String id, bool selected, {required bool isSpecialty}) {
    setState(() {
      if (selected) {
        if (!ids.contains(id)) ids.add(id);
      } else {
        ids.remove(id);
        if (id == _kOther) {
          if (isSpecialty) {
            _specialtyOtherController.clear();
          } else {
            _insuranceOtherController.clear();
          }
        }
      }
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final isLoggedIn = ref.read(authStateProvider).token != null;
    if (!isLoggedIn) {
      if (!mounted) return;
      context.push("/login?from=%2Fsuggest");
      return;
    }

    final specOtherOn = _selectedSpecialtyIds.contains(_kOther);
    final insOtherOn = _selectedInsuranceIds.contains(_kOther);
    if (specOtherOn && _specialtyOtherController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Descreva as especialidades em «Outros» ou desmarque a opção."))
      );
      return;
    }
    if (insOtherOn && _insuranceOtherController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Descreva os convênios em «Outros» ou desmarque a opção."))
      );
      return;
    }

    if (_isProf && _linkedClinicOtherOn) {
      if (_draftClinicNameController.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Indique o nome da clínica.")));
        return;
      }
      if (_draftClinicCityController.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Indique a cidade da clínica.")));
        return;
      }
    }
    if (_isProf && !_linkedClinicOtherOn && _cityController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Indique a cidade.")));
      return;
    }

    final specIds = _selectedSpecialtyIds.where((id) => id != _kOther).toList();
    final insIds = _selectedInsuranceIds.where((id) => id != _kOther).toList();

    setState(() => _loading = true);
    try {
      final linkedOther = _linkedClinicOtherOn;
      final cityOut =
          _isProf && linkedOther ? _draftClinicCityController.text.trim() : _cityController.text.trim();

      String? neighborhoodOut;
      String? addressOut;
      String? phoneOut;
      String? whatsOut;
      String? obsOut;

      if (_isProf) {
        if (linkedOther) {
          neighborhoodOut = _draftClinicNeighborhoodController.text.trim().isEmpty
              ? null
              : _draftClinicNeighborhoodController.text.trim();
          addressOut = _draftClinicAddressController.text.trim().isEmpty
              ? null
              : _draftClinicAddressController.text.trim();
          phoneOut = _draftClinicPhoneController.text.trim().isEmpty ? null : _draftClinicPhoneController.text.trim();
          whatsOut =
              _draftClinicWhatsappController.text.trim().isEmpty ? null : _draftClinicWhatsappController.text.trim();
        }
      } else {
        neighborhoodOut =
            _neighborhoodController.text.trim().isEmpty ? null : _neighborhoodController.text.trim();
        addressOut = _addressController.text.trim().isEmpty ? null : _addressController.text.trim();
        phoneOut = _phoneController.text.trim().isEmpty ? null : _phoneController.text.trim();
        whatsOut = _whatsappController.text.trim().isEmpty ? null : _whatsappController.text.trim();
        obsOut = _observationsController.text.trim().isEmpty ? null : _observationsController.text.trim();
      }

      String? linkedId;
      String? linkedName;
      if (_isProf) {
        if (_linkedClinicValue.isNotEmpty && _linkedClinicValue != _kOther) {
          linkedId = _linkedClinicValue;
        } else if (linkedOther) {
          linkedName = _draftClinicNameController.text.trim();
        }
      }

      await ref.read(collaborationApiProvider).suggest(
            targetType: _targetType,
            name: _nameController.text.trim(),
            city: cityOut,
            neighborhood: neighborhoodOut,
            addressLine: addressOut,
            linkedClinicId: linkedId,
            linkedClinicName: linkedName,
            professionalCrm: _isProf && _crmController.text.trim().isNotEmpty ? _crmController.text.trim() : null,
            phone: phoneOut,
            whatsappPhone: whatsOut,
            specialtyIds: specIds,
            specialtyOther: specOtherOn ? _specialtyOtherController.text.trim() : null,
            insuranceIds: insIds,
            insuranceOther: insOtherOn ? _insuranceOtherController.text.trim() : null,
            observations: obsOut
          );
      if (!mounted) return;
      ref.invalidate(specialtiesProvider);
      ref.invalidate(insurancesProvider);
      ref.invalidate(clinicSuggestListProvider);
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

  Widget _chipGrid({
    required AsyncValue<List<CatalogOption>> async,
    required List<String> selected,
    required void Function(String id, bool sel) onToggle
  }) {
    return async.when(
      loading: () => const Padding(
        padding: EdgeInsets.symmetric(vertical: 12),
        child: LinearProgressIndicator()
      ),
      error: (e, _) => Text("Erro ao carregar: $e", style: TextStyle(color: Theme.of(context).colorScheme.error)),
      data: (options) {
        final items = [
          ...options.map((o) => MapEntry(o.id, o.name)),
          const MapEntry(_kOther, "Outros")
        ];
        return Wrap(
          spacing: 8,
          runSpacing: 8,
          children: items
              .map(
                (e) => FilterChip(
                  label: Text(e.value),
                  selected: selected.contains(e.key),
                  onSelected: (v) => onToggle(e.key, v)
                )
              )
              .toList()
        );
      }
    );
  }

  @override
  Widget build(BuildContext context) {
    final specialtiesAsync = ref.watch(specialtiesProvider);
    final insurancesAsync = ref.watch(insurancesProvider);
    final clinicsAsync = ref.watch(clinicSuggestListProvider);

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
                    _isProf
                        ? "Sugestão rápida: escolha especialidades e convênios nas listas. Telefone e morada da clínica só aparecem se indicar «Outros» na clínica."
                        : "Cada sugestão passa por revisão. Use as listas quando possível — fica alinhado à busca do app.",
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
              key: ValueKey<String>("suggest-target-$_targetType"),
              initialValue: _targetType,
              decoration: const InputDecoration(labelText: "Tipo"),
              items: const [
                DropdownMenuItem(value: "clinica", child: Text("Clínica")),
                DropdownMenuItem(value: "profissional", child: Text("Profissional"))
              ],
              onChanged: (value) {
                final next = value ?? "clinica";
                setState(() {
                  _targetType = next;
                  if (next == "clinica") {
                    _linkedClinicValue = "";
                  }
                });
              }
            ),
            const SizedBox(height: AppDim.space3),
            const AppSectionHeader(
              title: "Dados básicos",
              subtitle: "Nome obrigatório."
            ),
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: "Nome"),
              textCapitalization: TextCapitalization.words,
              validator: (value) => (value == null || value.trim().isEmpty) ? "Informe o nome." : null
            ),
            if (_isProf) ...[
              const SizedBox(height: 12),
              TextFormField(
                controller: _crmController,
                decoration: const InputDecoration(
                  labelText: "CRM ou registro (opcional)",
                  hintText: "Ex.: CRM-SP 123456"
                ),
                maxLength: 80
              ),
              const SizedBox(height: AppDim.space2),
              const AppSectionHeader(
                title: "Clínica onde atende",
                subtitle: "Escolha na lista, não informar, ou «Outros» para uma clínica ainda não cadastrada."
              ),
              clinicsAsync.when(
                loading: () => const LinearProgressIndicator(),
                error: (e, _) => Text("Erro ao carregar clínicas: $e"),
                data: (clinics) {
                  return DropdownButtonFormField<String>(
                    key: ValueKey<String>("suggest-clinic-${clinics.length}-$_linkedClinicValue"),
                    initialValue: _linkedClinicValue,
                    decoration: const InputDecoration(labelText: "Clínica"),
                    items: [
                      const DropdownMenuItem(value: "", child: Text("— Não informar —")),
                      ...clinics.map(
                        (c) => DropdownMenuItem(value: c.id, child: Text(c.label, overflow: TextOverflow.ellipsis))
                      ),
                      const DropdownMenuItem(value: _kOther, child: Text("Outros (nova / não listada)"))
                    ],
                    onChanged: (v) => setState(() => _linkedClinicValue = v ?? "")
                  );
                }
              ),
              if (_linkedClinicOtherOn) ...[
                const SizedBox(height: 12),
                TextFormField(
                  controller: _draftClinicNameController,
                  decoration: const InputDecoration(labelText: "Nome da clínica"),
                  textCapitalization: TextCapitalization.words,
                  validator: (v) =>
                      _linkedClinicOtherOn && (v == null || v.trim().isEmpty) ? "Obrigatório." : null
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _draftClinicCityController,
                  decoration: const InputDecoration(labelText: "Cidade da clínica"),
                  textCapitalization: TextCapitalization.words,
                  validator: (v) =>
                      _linkedClinicOtherOn && (v == null || v.trim().isEmpty) ? "Obrigatório." : null
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _draftClinicNeighborhoodController,
                  decoration: const InputDecoration(labelText: "Bairro da clínica (opcional)")
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _draftClinicAddressController,
                  decoration: const InputDecoration(
                    labelText: "Morada da clínica (opcional)",
                    hintText: "Rua e número"
                  ),
                  textCapitalization: TextCapitalization.sentences
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _draftClinicPhoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: "Telefone da clínica (opcional)")
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _draftClinicWhatsappController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: "WhatsApp da clínica (opcional)")
                )
              ]
            ],
            const SizedBox(height: AppDim.space3),
            const AppSectionHeader(
              title: "Especialidades",
              subtitle: "Toque para marcar; «Outros» abre campo de texto."
            ),
            _chipGrid(
              async: specialtiesAsync,
              selected: _selectedSpecialtyIds,
              onToggle: (id, sel) => _toggleId(_selectedSpecialtyIds, id, sel, isSpecialty: true)
            ),
            if (_selectedSpecialtyIds.contains(_kOther)) ...[
              const SizedBox(height: 12),
              TextFormField(
                controller: _specialtyOtherController,
                decoration: const InputDecoration(
                  labelText: "Descreva as especialidades (Outros)",
                  hintText: "Ex.: Musicoterapia"
                ),
                maxLines: 2
              )
            ],
            const SizedBox(height: AppDim.space3),
            const AppSectionHeader(
              title: "Convênios",
              subtitle: "Mesmo esquema: lista + Outros."
            ),
            _chipGrid(
              async: insurancesAsync,
              selected: _selectedInsuranceIds,
              onToggle: (id, sel) => _toggleId(_selectedInsuranceIds, id, sel, isSpecialty: false)
            ),
            if (_selectedInsuranceIds.contains(_kOther)) ...[
              const SizedBox(height: 12),
              TextFormField(
                controller: _insuranceOtherController,
                decoration: const InputDecoration(
                  labelText: "Descreva os convênios (Outros)",
                  hintText: "Ex.: Plano municipal X"
                ),
                maxLines: 2
              )
            ],
            const SizedBox(height: AppDim.space3),
            AppSectionHeader(
              title: "Localização",
              subtitle: _isProf && !_linkedClinicOtherOn
                  ? "Cidade do profissional (obrigatória se não usar «Outros» na clínica)."
                  : _isProf && _linkedClinicOtherOn
                      ? "A cidade da clínica foi pedida acima."
                      : "Cidade da clínica e campos opcionais."
            ),
            if (!_isProf || !_linkedClinicOtherOn) ...[
              TextFormField(
                controller: _cityController,
                decoration: InputDecoration(
                  labelText: _isProf ? "Cidade" : "Cidade",
                  hintText: _isProf ? "Onde o profissional atende" : null
                ),
                textCapitalization: TextCapitalization.words,
                validator: (value) {
                  if (_isProf && _linkedClinicOtherOn) return null;
                  if (value == null || value.trim().isEmpty) return "Informe a cidade.";
                  return null;
                }
              )
            ],
            if (!_isProf) ...[
              const SizedBox(height: 12),
              TextFormField(
                controller: _neighborhoodController,
                decoration: const InputDecoration(labelText: "Bairro (opcional)")
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(
                  labelText: "Morada (opcional)",
                  hintText: "Rua e número"
                ),
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
              const SizedBox(height: 12),
              TextFormField(
                controller: _observationsController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: "Observações",
                  alignLabelWithHint: true
                )
              )
            ],
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
