import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { randomBytes } from "crypto";
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

function splitCommaList(value: string | null | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function slugBase(label: string): string {
  const ascii = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return ascii || "item";
}

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

  private async uniqueSpecialtySlug(base: string, maxLen: number): Promise<string> {
    let slug = base.slice(0, maxLen);
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const hit = await this.specialtiesRepository.findOne({ where: { slug } });
      if (!hit) return slug;
      const suffix = `-${randomBytes(3).toString("hex")}`;
      slug = `${base.slice(0, Math.max(1, maxLen - suffix.length))}${suffix}`.slice(0, maxLen);
    }
    return `${base.slice(0, 40)}-${randomBytes(4).toString("hex")}`.slice(0, maxLen);
  }

  private async uniqueInsuranceSlug(base: string, maxLen: number): Promise<string> {
    let slug = base.slice(0, maxLen);
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const hit = await this.insurancesRepository.findOne({ where: { slug } });
      if (!hit) return slug;
      const suffix = `-${randomBytes(3).toString("hex")}`;
      slug = `${base.slice(0, Math.max(1, maxLen - suffix.length))}${suffix}`.slice(0, maxLen);
    }
    return `${base.slice(0, 40)}-${randomBytes(4).toString("hex")}`.slice(0, maxLen);
  }

  private async findOrCreateSpecialtyByName(rawName: string): Promise<SpecialtyEntity> {
    const name = rawName.trim();
    if (!name) {
      throw new BadRequestException("Nome de especialidade vazio.");
    }
    const existing = await this.specialtiesRepository
      .createQueryBuilder("s")
      .where("LOWER(s.name) = LOWER(:n)", { n: name })
      .getOne();
    if (existing) {
      return existing;
    }
    const base = slugBase(name);
    const slug = await this.uniqueSpecialtySlug(base, 60);
    return this.specialtiesRepository.save(
      this.specialtiesRepository.create({
        slug,
        name: name.length > 120 ? name.slice(0, 120) : name
      })
    );
  }

  private async findOrCreateInsuranceByName(rawName: string): Promise<InsuranceEntity> {
    const name = rawName.trim();
    if (!name) {
      throw new BadRequestException("Nome de convênio vazio.");
    }
    const existing = await this.insurancesRepository
      .createQueryBuilder("i")
      .where("LOWER(i.name) = LOWER(:n)", { n: name })
      .getOne();
    if (existing) {
      return existing;
    }
    const base = slugBase(name);
    const slug = await this.uniqueInsuranceSlug(base, 60);
    return this.insurancesRepository.save(
      this.insurancesRepository.create({
        slug: slug as string,
        name: name.length > 120 ? name.slice(0, 120) : name
      })
    );
  }

  /** IDs finais (catálogo existente + criados a partir de «Outros»). */
  private async collectSpecialtyIdsFromSuggestion(suggestion: ClinicSuggestionEntity): Promise<string[]> {
    const ids = new Set<string>();
    if (suggestion.specialtyIds?.length) {
      const found = await this.specialtiesRepository.findBy({ id: In(suggestion.specialtyIds) });
      if (found.length !== suggestion.specialtyIds.length) {
        throw new BadRequestException("Uma ou mais especialidades da sugestão são inválidas.");
      }
      for (const s of found) {
        ids.add(s.id);
      }
    }
    for (const piece of splitCommaList(suggestion.specialtyOther)) {
      const ent = await this.findOrCreateSpecialtyByName(piece);
      ids.add(ent.id);
    }
    return [...ids];
  }

  private async collectInsuranceIdsFromSuggestion(suggestion: ClinicSuggestionEntity): Promise<string[]> {
    const ids = new Set<string>();
    if (suggestion.insuranceIds?.length) {
      const found = await this.insurancesRepository.findBy({ id: In(suggestion.insuranceIds) });
      if (found.length !== suggestion.insuranceIds.length) {
        throw new BadRequestException("Um ou mais convênios da sugestão são inválidos.");
      }
      for (const i of found) {
        ids.add(i.id);
      }
    }
    for (const piece of splitCommaList(suggestion.insuranceOther)) {
      const ent = await this.findOrCreateInsuranceByName(piece);
      ids.add(ent.id);
    }
    return [...ids];
  }

  private async mergeClinicCatalog(clinicId: string, specialtyIds: string[], insuranceIds: string[]) {
    const clinic = await this.clinicsRepository.findOne({
      where: { id: clinicId },
      relations: { specialties: true, insurances: true }
    });
    if (!clinic) {
      throw new BadRequestException("Clínica alvo não encontrada para associar especialidades/convênios.");
    }
    const specMap = new Map((clinic.specialties ?? []).map((s) => [s.id, s]));
    for (const id of [...new Set(specialtyIds)]) {
      if (!specMap.has(id)) {
        const row = await this.specialtiesRepository.findOneBy({ id });
        if (row) specMap.set(id, row);
      }
    }
    const insMap = new Map((clinic.insurances ?? []).map((i) => [i.id, i]));
    for (const id of [...new Set(insuranceIds)]) {
      if (!insMap.has(id)) {
        const row = await this.insurancesRepository.findOneBy({ id });
        if (row) insMap.set(id, row);
      }
    }
    clinic.specialties = [...specMap.values()];
    clinic.insurances = [...insMap.values()];
    await this.clinicsRepository.save(clinic);
  }

  private async mergeProfessionalCatalog(professionalId: string, specialtyIds: string[], insuranceIds: string[]) {
    const pro = await this.professionalsRepository.findOne({
      where: { id: professionalId },
      relations: { specialties: true, insurances: true }
    });
    if (!pro) {
      throw new BadRequestException("Profissional não encontrado para associar especialidades/convênios.");
    }
    const specMap = new Map((pro.specialties ?? []).map((s) => [s.id, s]));
    for (const id of [...new Set(specialtyIds)]) {
      if (!specMap.has(id)) {
        const row = await this.specialtiesRepository.findOneBy({ id });
        if (row) specMap.set(id, row);
      }
    }
    const insMap = new Map((pro.insurances ?? []).map((i) => [i.id, i]));
    for (const id of [...new Set(insuranceIds)]) {
      if (!insMap.has(id)) {
        const row = await this.insurancesRepository.findOneBy({ id });
        if (row) insMap.set(id, row);
      }
    }
    pro.specialties = [...specMap.values()];
    pro.insurances = [...insMap.values()];
    await this.professionalsRepository.save(pro);
  }

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

      const clinic = await this.clinicsRepository.save(
        this.clinicsRepository.create({
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
          isVerified: false
        })
      );

      const specIds = await this.collectSpecialtyIdsFromSuggestion(suggestion);
      const insIds = await this.collectInsuranceIdsFromSuggestion(suggestion);
      await this.mergeClinicCatalog(clinic.id, specIds, insIds);

      return { clinicId: clinic.id, createdNewClinic: true };
    }

    if (suggestion.linkedClinicId) {
      return { clinicId: suggestion.linkedClinicId, createdNewClinic: false };
    }

    throw new BadRequestException(
      "Profissional sem clínica válida na sugestão: envie `professionalClinicId` (clínica existente) ou `createNewClinicFromDraft: true` (criar clínica a partir do rascunho / «Outros»)."
    );
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

      const specIds = await this.collectSpecialtyIdsFromSuggestion(suggestion);
      const insIds = await this.collectInsuranceIdsFromSuggestion(suggestion);
      await this.mergeClinicCatalog(clinic.id, specIds, insIds);

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

      const specIds = await this.collectSpecialtyIdsFromSuggestion(suggestion);
      const insIds = await this.collectInsuranceIdsFromSuggestion(suggestion);
      await this.mergeProfessionalCatalog(professional.id, specIds, insIds);
      await this.mergeClinicCatalog(clinicId, specIds, insIds);

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
