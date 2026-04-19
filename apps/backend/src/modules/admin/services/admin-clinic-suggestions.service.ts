import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Role } from "../../../common/enums/role.enum";
import { InsuranceEntity } from "../../catalog/entities/insurance.entity";
import { SpecialtyEntity } from "../../catalog/entities/specialty.entity";
import { ClinicEntity } from "../../listings/entities/clinic.entity";
import { ProfessionalEntity } from "../../professionals/entities/professional.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { ClinicSuggestionEntity } from "../../collaboration/entities/clinic-suggestion.entity";
import { StatusHistoryEntity } from "../../collaboration/entities/status-history.entity";
import { ReviewStatus } from "../../collaboration/enums/review-status.enum";
import { SuggestionTargetType } from "../../collaboration/enums/suggestion-target-type.enum";
import { ApproveClinicSuggestionDto } from "../dto/approve-clinic-suggestion.dto";
import { ReviewRequestDto } from "../../collaboration/dto/review-request.dto";

@Injectable()
export class AdminClinicSuggestionsService {
  constructor(
    @InjectRepository(ClinicSuggestionEntity)
    private readonly suggestionsRepository: Repository<ClinicSuggestionEntity>,
    @InjectRepository(ClinicEntity)
    private readonly clinicsRepository: Repository<ClinicEntity>,
    @InjectRepository(ProfessionalEntity)
    private readonly professionalsRepository: Repository<ProfessionalEntity>,
    @InjectRepository(StatusHistoryEntity)
    private readonly statusHistoryRepository: Repository<StatusHistoryEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(SpecialtyEntity)
    private readonly specialtiesRepository: Repository<SpecialtyEntity>,
    @InjectRepository(InsuranceEntity)
    private readonly insurancesRepository: Repository<InsuranceEntity>
  ) {}

  list(status?: ReviewStatus) {
    return this.suggestionsRepository.find({
      where: status ? { status } : undefined,
      order: { createdAt: "ASC" }
    });
  }

  private async createHistory(input: {
    entityId: string;
    fromStatus: ReviewStatus;
    toStatus: ReviewStatus;
    actedByUserId: string;
    note?: string;
  }) {
    await this.statusHistoryRepository.save(
      this.statusHistoryRepository.create({
        entityType: "clinic_suggestion",
        entityId: input.entityId,
        fromStatus: input.fromStatus,
        toStatus: input.toStatus,
        actedByUserId: input.actedByUserId,
        note: input.note?.trim() || null
      })
    );
  }

  /**
   * Resolve a clínica final para um profissional sugerido.
   * Ordem: override do admin → criar rascunho → vínculo já escolhido na sugestão.
   */
  private async resolveClinicIdForProfessional(
    suggestion: ClinicSuggestionEntity,
    dto: ApproveClinicSuggestionDto
  ): Promise<{ clinicId: string; createdNewClinic: boolean }> {
    if (dto.professionalClinicId && dto.createNewClinicFromDraft === true) {
      throw new BadRequestException(
        "Use apenas `professionalClinicId` (vincular) ou `createNewClinicFromDraft: true` (criar nova), não ambos."
      );
    }

    if (dto.professionalClinicId) {
      const c = await this.clinicsRepository.findOne({ where: { id: dto.professionalClinicId } });
      if (!c) {
        throw new BadRequestException("Clínica indicada em `professionalClinicId` não encontrada.");
      }
      return { clinicId: dto.professionalClinicId, createdNewClinic: false };
    }

    if (dto.createNewClinicFromDraft === true) {
      if (suggestion.linkedClinicId) {
        throw new BadRequestException(
          "Esta sugestão já referencia uma clínica existente; não use `createNewClinicFromDraft`."
        );
      }
      const draftName = (dto.draftClinicName ?? suggestion.linkedClinicName ?? "").trim();
      if (!draftName) {
        throw new BadRequestException(
          "Para criar clínica nova, preencha o nome (rascunho na sugestão ou campo `draftClinicName`)."
        );
      }
      const draftCity = (dto.draftClinicCity ?? suggestion.city ?? "").trim();
      if (!draftCity) {
        throw new BadRequestException("Cidade da nova clínica é obrigatória (`draftClinicCity` ou cidade da sugestão).");
      }

      const normalizedName = draftName.toLowerCase();
      const normalizedCity = draftCity.toLowerCase();
      const dup = await this.clinicsRepository
        .createQueryBuilder("c")
        .where("LOWER(c.name) = :name", { name: normalizedName })
        .andWhere("LOWER(c.city) = :city", { city: normalizedCity })
        .getOne();
      if (dup) {
        throw new BadRequestException(
          "Já existe clínica com este nome e cidade. Vincule com `professionalClinicId` em vez de criar."
        );
      }

      const specs = suggestion.specialtyIds?.length
        ? await this.specialtiesRepository.findBy({ id: In(suggestion.specialtyIds) })
        : [];
      const ins = suggestion.insuranceIds?.length
        ? await this.insurancesRepository.findBy({ id: In(suggestion.insuranceIds) })
        : [];

      const clinic = this.clinicsRepository.create({
        name: draftName,
        city: draftCity,
        neighborhood: suggestion.neighborhood,
        addressLine: suggestion.addressLine,
        phone: suggestion.phone,
        whatsappPhone: suggestion.whatsappPhone,
        description: suggestion.observations,
        rating: 0,
        acceptsOnline: false,
        supportsTeaTdh: true,
        addedByCommunity: true,
        isClaimed: false,
        isVerified: false,
        specialties: specs,
        insurances: ins
      });
      const saved = await this.clinicsRepository.save(clinic);
      return { clinicId: saved.id, createdNewClinic: true };
    }

    if (suggestion.linkedClinicId) {
      return { clinicId: suggestion.linkedClinicId, createdNewClinic: false };
    }

    throw new BadRequestException(
      "Profissional sem clínica válida na sugestão: envie `professionalClinicId` (clínica existente) ou `createNewClinicFromDraft: true` (criar clínica a partir do rascunho / «Outros»)."
    );
  }

  private async attachProfessionalCatalog(
    professional: ProfessionalEntity,
    suggestion: ClinicSuggestionEntity
  ) {
    const specs = suggestion.specialtyIds?.length
      ? await this.specialtiesRepository.findBy({ id: In(suggestion.specialtyIds) })
      : [];
    const ins = suggestion.insuranceIds?.length
      ? await this.insurancesRepository.findBy({ id: In(suggestion.insuranceIds) })
      : [];
    professional.specialties = specs;
    professional.insurances = ins;
    await this.professionalsRepository.save(professional);
  }

  async approve(id: string, adminUserId: string, dto: ApproveClinicSuggestionDto) {
    const suggestion = await this.suggestionsRepository.findOne({ where: { id } });
    if (!suggestion) {
      throw new NotFoundException("Sugestão não encontrada.");
    }
    if (suggestion.status !== ReviewStatus.PENDING) {
      throw new BadRequestException("Apenas sugestões pendentes podem ser aprovadas.");
    }

    let approvalHistoryNote = dto.note?.trim() || undefined;

    const normalizedName = suggestion.name.trim().toLowerCase();
    const normalizedCity = suggestion.city.trim().toLowerCase();
    const normalizedPhone = suggestion.phone?.replace(/\D/g, "") ?? "";

    if (suggestion.targetType === SuggestionTargetType.CLINIC) {
      if (dto.professionalClinicId != null || dto.createNewClinicFromDraft === true) {
        throw new BadRequestException("Campos de vínculo de profissional não se aplicam a sugestão de clínica.");
      }

      const duplicate = await this.clinicsRepository
        .createQueryBuilder("clinic")
        .where("LOWER(clinic.name) = :name", { name: normalizedName })
        .andWhere("LOWER(clinic.city) = :city", { city: normalizedCity })
        .getOne();

      if (duplicate && (!normalizedPhone || (duplicate.phone ?? "").replace(/\D/g, "") === normalizedPhone)) {
        throw new BadRequestException("Sugestão duplicada de clínica já existente.");
      }

      const clinic = await this.clinicsRepository.save(
        this.clinicsRepository.create({
          name: suggestion.name,
          city: suggestion.city,
          neighborhood: suggestion.neighborhood,
          addressLine: suggestion.addressLine,
          phone: suggestion.phone,
          whatsappPhone: suggestion.whatsappPhone,
          description: suggestion.observations,
          rating: 0,
          acceptsOnline: false,
          supportsTeaTdh: true,
          addedByCommunity: true,
          isClaimed: false,
          isVerified: false
        })
      );

      suggestion.approvedClinicId = clinic.id;
    } else {
      const duplicate = await this.professionalsRepository
        .createQueryBuilder("professional")
        .where("LOWER(professional.name) = :name", { name: normalizedName })
        .andWhere("LOWER(professional.city) = :city", { city: normalizedCity })
        .getOne();

      if (duplicate && (!normalizedPhone || (duplicate.phone ?? "").replace(/\D/g, "") === normalizedPhone)) {
        throw new BadRequestException("Sugestão duplicada de profissional já existente.");
      }

      const { clinicId, createdNewClinic } = await this.resolveClinicIdForProfessional(suggestion, dto);

      const professional = await this.professionalsRepository.save(
        this.professionalsRepository.create({
          name: suggestion.name,
          city: suggestion.city,
          neighborhood: suggestion.neighborhood,
          crm: suggestion.professionalCrm?.trim() || null,
          phone: suggestion.phone,
          whatsappPhone: suggestion.whatsappPhone,
          clinicId,
          rating: 0,
          acceptsOnline: false,
          supportsTeaTdh: true,
          addedByCommunity: true,
          isClaimed: false,
          isVerified: false
        })
      );

      await this.attachProfessionalCatalog(professional, suggestion);

      suggestion.approvedProfessionalId = professional.id;
      suggestion.approvedClinicId = clinicId;
      if (createdNewClinic) {
        approvalHistoryNote = approvalHistoryNote
          ? `${approvalHistoryNote} | Clínica criada na aprovação.`
          : "Clínica criada na aprovação a partir do rascunho.";
      }
    }

    suggestion.status = ReviewStatus.APPROVED;
    suggestion.reviewedByUserId = adminUserId;
    suggestion.reviewedAt = new Date();
    const saved = await this.suggestionsRepository.save(suggestion);

    await this.createHistory({
      entityId: suggestion.id,
      fromStatus: ReviewStatus.PENDING,
      toStatus: ReviewStatus.APPROVED,
      actedByUserId: adminUserId,
      note: approvalHistoryNote
    });

    await this.usersRepository.update({ id: suggestion.suggestedByUserId }, { role: Role.OWNER });

    return saved;
  }

  async reject(id: string, adminUserId: string, dto: ReviewRequestDto) {
    const suggestion = await this.suggestionsRepository.findOne({ where: { id } });
    if (!suggestion) {
      throw new NotFoundException("Sugestão não encontrada.");
    }
    if (suggestion.status !== ReviewStatus.PENDING) {
      throw new BadRequestException("Apenas sugestões pendentes podem ser rejeitadas.");
    }

    suggestion.status = ReviewStatus.REJECTED;
    suggestion.reviewedByUserId = adminUserId;
    suggestion.reviewedAt = new Date();
    const saved = await this.suggestionsRepository.save(suggestion);

    await this.createHistory({
      entityId: suggestion.id,
      fromStatus: ReviewStatus.PENDING,
      toStatus: ReviewStatus.REJECTED,
      actedByUserId: adminUserId,
      note: dto.note
    });

    return saved;
  }

  history(suggestionId: string) {
    return this.statusHistoryRepository.find({
      where: { entityType: "clinic_suggestion", entityId: suggestionId },
      order: { createdAt: "ASC" }
    });
  }
}
