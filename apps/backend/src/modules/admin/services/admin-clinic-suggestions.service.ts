import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../../../common/enums/role.enum";
import { ClinicEntity } from "../../listings/entities/clinic.entity";
import { ProfessionalEntity } from "../../professionals/entities/professional.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { ReviewRequestDto } from "../../collaboration/dto/review-request.dto";
import { ClinicSuggestionEntity } from "../../collaboration/entities/clinic-suggestion.entity";
import { StatusHistoryEntity } from "../../collaboration/entities/status-history.entity";
import { ReviewStatus } from "../../collaboration/enums/review-status.enum";
import { SuggestionTargetType } from "../../collaboration/enums/suggestion-target-type.enum";

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
    private readonly usersRepository: Repository<UserEntity>
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

  async approve(id: string, adminUserId: string, dto: ReviewRequestDto) {
    const suggestion = await this.suggestionsRepository.findOne({ where: { id } });
    if (!suggestion) {
      throw new NotFoundException("Sugestão não encontrada.");
    }
    if (suggestion.status !== ReviewStatus.PENDING) {
      throw new BadRequestException("Apenas sugestões pendentes podem ser aprovadas.");
    }

    const normalizedName = suggestion.name.trim().toLowerCase();
    const normalizedCity = suggestion.city.trim().toLowerCase();
    const normalizedPhone = suggestion.phone?.replace(/\D/g, "") ?? "";

    if (suggestion.targetType === SuggestionTargetType.CLINIC) {
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

      const professional = await this.professionalsRepository.save(
        this.professionalsRepository.create({
          name: suggestion.name,
          city: suggestion.city,
          neighborhood: suggestion.neighborhood,
          phone: suggestion.phone,
          whatsappPhone: suggestion.whatsappPhone,
          clinicId: null,
          rating: 0,
          acceptsOnline: false,
          supportsTeaTdh: true,
          addedByCommunity: true,
          isClaimed: false,
          isVerified: false
        })
      );

      suggestion.approvedProfessionalId = professional.id;
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
      note: dto.note
    });

    // Keep requester role as "owner" candidate when admin approves their contribution.
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
