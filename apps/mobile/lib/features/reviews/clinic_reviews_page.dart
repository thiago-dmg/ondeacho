import "package:dio/dio.dart";
import "package:flutter/foundation.dart";
import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "package:lucide_icons/lucide_icons.dart";
import "../../core/network/api_client.dart";
import "../../core/utils/uuid.dart";
import "../../core/widgets/lucide_icon.dart";
import "../../core/theme/app_colors.dart";
import "../../core/theme/app_dimensions.dart";
import "../../core/widgets/app_rating_stars.dart";
import "../auth/auth_state.dart";
import "../discovery/clinic_listing.dart";
import "../discovery/discovery_provider.dart";
import "reviews_provider.dart";

/// `listingId` = parâmetro da rota `/listing/:id/reviews` (mesmo valor usado em GET `/listings/:id`).
/// O POST `/reviews` deve enviar sempre [ClinicListing.id] vindo da API (`GET /listings/:id`), não só o texto da rota.
class ClinicReviewsPage extends ConsumerStatefulWidget {
  final String listingId;
  final String clinicName;

  const ClinicReviewsPage({super.key, required this.listingId, required this.clinicName});

  @override
  ConsumerState<ClinicReviewsPage> createState() => _ClinicReviewsPageState();
}

class _ClinicReviewsPageState extends ConsumerState<ClinicReviewsPage> {
  int _selectedRating = 5;
  final _commentController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  /// ID da clínica no banco: sempre o `id` do JSON de `/listings/:id`.
  String? _resolvedClinicId(AsyncValue<ClinicListing> clinicAsync) {
    return clinicAsync.maybeWhen(
      data: (ClinicListing c) => c.id.trim(),
      orElse: () => null
    );
  }

  Future<void> _submit() async {
    final isLoggedIn = ref.read(authStateProvider).token != null;
    if (!isLoggedIn) {
      if (!mounted) return;
      context.push("/login?from=%2Flisting%2F${widget.listingId}%2Freviews");
      return;
    }
    final comment = _commentController.text.trim();
    if (comment.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Escreva um comentário sobre sua experiência."))
      );
      return;
    }

    final clinicAsync = ref.read(clinicDetailProvider(widget.listingId));
    final clinicId = _resolvedClinicId(clinicAsync);
    if (clinicId == null || clinicId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Aguarde os dados da clínica carregarem e tente novamente."))
      );
      return;
    }
    if (!isValidUuid(clinicId)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Identificador da clínica inválido. Volte e abra a clínica novamente."))
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      if (kDebugMode) {
        debugPrint("[OndeAcho] Sending review with clinicId: $clinicId");
      }
      final dio = ref.read(dioProvider);
      await dio.post<void>(
        "/reviews",
        data: {
          "clinicId": clinicId,
          "rating": _selectedRating,
          "comment": comment
        }
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Avaliação enviada. Ela aparecerá após moderação."))
      );
      _commentController.clear();
      ref.invalidate(clinicReviewsListProvider(clinicId));
      ref.invalidate(reviewSummaryProvider(clinicId));
      ref.invalidate(clinicDetailProvider(clinicId));
    } on DioException catch (e) {
      if (!mounted) return;
      final msg = e.response?.data is Map
          ? (e.response?.data["message"]?.toString() ?? "Não foi possível enviar.")
          : "Não foi possível enviar.";
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final clinicAsync = ref.watch(clinicDetailProvider(widget.listingId));
    final reviewKey = clinicAsync.maybeWhen(
      data: (c) => c.id.trim(),
      orElse: () => widget.listingId.trim()
    );
    final summaryAsync = ref.watch(reviewSummaryProvider(reviewKey));
    final listAsync = ref.watch(clinicReviewsListProvider(reviewKey));
    final isLoggedIn = ref.watch(authStateProvider).token != null;

    final resolvedId = _resolvedClinicId(clinicAsync);
    final clinicReady =
        resolvedId != null && resolvedId.isNotEmpty && isValidUuid(resolvedId);
    final canSendReview = isLoggedIn && clinicReady && !_submitting;

    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 72,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              "Avaliações",
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800, fontSize: 20)
            ),
            Text(
              widget.clinicName,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)
            )
          ]
        )
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppDim.space2),
        children: [
          if (clinicAsync.hasError)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(
                "Não foi possível confirmar esta clínica no servidor. Verifique a conexão e tente abrir o detalhe de novo.",
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.attention)
              )
            ),
          summaryAsync.when(
            data: (s) => Container(
              padding: const EdgeInsets.all(AppDim.space2),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(AppDim.radiusCard),
                border: Border.all(color: AppColors.divider),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.shadow,
                    blurRadius: AppDim.cardShadowBlur,
                    offset: const Offset(0, AppDim.cardShadowY)
                  )
                ]
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Resumo na comunidade",
                    style: Theme.of(context).textTheme.titleMedium
                  ),
                  const SizedBox(height: 12),
                  if (s.averageRating != null && s.reviewCount > 0) ...[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          s.averageRating!.toStringAsFixed(1),
                          style: Theme.of(context).textTheme.displaySmall?.copyWith(
                                fontSize: 40,
                                fontWeight: FontWeight.w800,
                                color: AppColors.primary
                              )
                        ),
                        const SizedBox(width: 12),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: AppRatingStars(value: s.averageRating!, size: 26)
                        )
                      ]
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "${s.reviewCount} avaliações publicadas",
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)
                    )
                  ] else
                    Row(
                      children: [
                        const LIcon(LucideIcons.info, color: AppColors.attention, size: LucideSize.lg),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            "Ainda não há avaliações publicadas. Seja a primeira família a contribuir.",
                            style: Theme.of(context).textTheme.bodyMedium
                          )
                        )
                      ]
                    )
                ]
              )
            ),
            loading: () => const Padding(
              padding: EdgeInsets.all(24),
              child: Center(child: CircularProgressIndicator())
            ),
            error: (e, _) => Text("Erro ao carregar resumo: $e")
          ),
          const SizedBox(height: AppDim.space3),
          Text(
            "Sua avaliação",
            style: Theme.of(context).textTheme.titleMedium
          ),
          const SizedBox(height: 8),
          Text(
            "Sua opinião ajuda outras famílias a escolherem com mais segurança.",
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)
          ),
          const SizedBox(height: 12),
          if (!isLoggedIn)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.neutralBadgeBg,
                borderRadius: BorderRadius.circular(12)
              ),
              child: Text(
                "Entre na conta para enviar sua avaliação.",
                style: Theme.of(context).textTheme.bodyMedium
              )
            )
          else ...[
            if (isLoggedIn && !clinicReady && clinicAsync.isLoading)
              const Padding(
                padding: EdgeInsets.only(bottom: 8),
                child: Text("Carregando dados da clínica…", style: TextStyle(color: AppColors.textSecondary)),
              ),
            Text(
              "Toque nas estrelas",
              style: Theme.of(context).textTheme.labelLarge?.copyWith(color: AppColors.textSecondary)
            ),
            const SizedBox(height: 8),
            AppInteractiveStars(
              value: _selectedRating,
              size: 36,
              onChanged: (v) {
                if (!clinicReady) {
                  return;
                }
                setState(() => _selectedRating = v);
              }
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _commentController,
              maxLines: 4,
              enabled: clinicReady,
              decoration: const InputDecoration(
                labelText: "Comentário",
                hintText: "Conte como foi o atendimento, o acolhimento e o que mais importou para você",
                alignLabelWithHint: true
              )
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: canSendReview ? _submit : null,
              child: Text(_submitting ? "Enviando..." : "Enviar avaliação")
            ),
            const SizedBox(height: 8),
            Text(
              "As avaliações passam por moderação para manter respeito e confiabilidade.",
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)
            )
          ],
          const SizedBox(height: AppDim.space3),
          Text(
            "Comentários publicados",
            style: Theme.of(context).textTheme.titleMedium
          ),
          const SizedBox(height: 12),
          listAsync.when(
            data: (items) {
              if (items.isEmpty) {
                return Text(
                  "Nenhuma avaliação publicada ainda.",
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)
                );
              }
              return Column(
                children: items
                    .map(
                      (r) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Container(
                          width: double.infinity,
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
                                  CircleAvatar(
                                    radius: 18,
                                    backgroundColor: AppColors.accent.withValues(alpha: 0.12),
                                    child: Text(
                                      r.authorName.isNotEmpty ? r.authorName[0].toUpperCase() : "?",
                                      style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.accent
                                      )
                                    )
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      r.authorName,
                                      style: Theme.of(context).textTheme.titleSmall
                                    )
                                  ),
                                  AppRatingStars(value: r.rating.toDouble(), size: 18)
                                ]
                              ),
                              const SizedBox(height: 12),
                              Text(
                                r.comment,
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)
                              )
                            ]
                          )
                        )
                      )
                    )
                    .toList()
              );
            },
            loading: () => const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator())),
            error: (e, _) => Text("Erro: $e")
          )
        ]
      )
    );
  }
}
