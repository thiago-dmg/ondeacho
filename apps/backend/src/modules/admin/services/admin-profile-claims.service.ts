import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../../../common/enums/role.enum";
import { ReviewRequestDto } from "../../collaboration/dto/review-request.dto";
import { ProfileClaimRequestEntity } from "../../collaboration/entities/profile-claim-request.entity";
import { ProfileOwnerEntity } from "../../collaboration/entities/profile-owner.entity";
import { StatusHistoryEntity } from "../../collaboration/entities/status-history.entity";
import { ReviewStatus } from "../../collaboration/enums/review-status.enum";
import { ClinicEntity } from "../../listings/entities/clinic.entity";
import { ProfessionalEntity } from "../../professionals/entities/professional.entity";
import { UserEntity } from "../../users/entities/user.entity";

@Injectable()
export class AdminProfileClaimsService {
  constructor(
    @InjectRepository(ProfileClaimRequestEntity)
    private readonly claimsRepository: Repository<ProfileClaimRequestEntity>,
    @InjectRepository(ProfileOwnerEntity)
    private readonly ownersRepository: Repository<ProfileOwnerEntity>,
    @InjectRepository(StatusHistoryEntity)
    private readonly statusHistoryRepository: Repository<StatusHistoryEntity>,
    @InjectRepository(ClinicEntity)
    private readonly clinicsRepository: Repository<ClinicEntity>,
    @InjectRepository(ProfessionalEntity)
    private readonly professionalsRepository: Repository<ProfessionalEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {}

  list(status?: ReviewStatus) {
    return this.claimsRepository.find({
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
        entityType: "profile_claim_request",
        entityId: input.entityId,
        fromStatus: input.fromStatus,
        toStatus: input.toStatus,
        actedByUserId: input.actedByUserId,
        note: input.note?.trim() || null
      })
    );
  }

  async approve(id: string, adminUserId: string, dto: ReviewRequestDto) {
    const claim = await this.claimsRepository.findOne({ where: { id } });
    if (!claim) {
      throw new NotFoundException("Solicitação de reivindicação não encontrada.");
    }
    if (claim.status !== ReviewStatus.PENDING) {
      throw new BadRequestException("Apenas solicitações pendentes podem ser aprovadas.");
    }

    if (claim.clinicId) {
      const clinic = await this.clinicsRepository.findOne({ where: { id: claim.clinicId } });
      if (!clinic) throw new NotFoundException("Clínica não encontrada para vinculação.");
      const existingClinicOwner = await this.ownersRepository.findOne({
        where: { clinicId: claim.clinicId }
      });
      if (existingClinicOwner) {
        throw new BadRequestException("Esta clínica já possui proprietário aprovado.");
      }
      clinic.isClaimed = true;
      clinic.isVerified = true;
      await this.clinicsRepository.save(clinic);
    }

    if (claim.professionalId) {
      const professional = await this.professionalsRepository.findOne({
        where: { id: claim.professionalId }
      });
      if (!professional) throw new NotFoundException("Profissional não encontrado para vinculação.");
      const existingProfessionalOwner = await this.ownersRepository.findOne({
        where: { professionalId: claim.professionalId }
      });
      if (existingProfessionalOwner) {
        throw new BadRequestException("Este profissional já possui proprietário aprovado.");
      }
      professional.isClaimed = true;
      professional.isVerified = true;
      await this.professionalsRepository.save(professional);
    }

    await this.ownersRepository.save(
      this.ownersRepository.create({
        userId: claim.requesterUserId,
        clinicId: claim.clinicId,
        professionalId: claim.professionalId
      })
    );

    await this.usersRepository.update({ id: claim.requesterUserId }, { role: Role.OWNER });

    claim.status = ReviewStatus.APPROVED;
    claim.reviewedByUserId = adminUserId;
    claim.reviewedAt = new Date();
    const saved = await this.claimsRepository.save(claim);

    await this.createHistory({
      entityId: claim.id,
      fromStatus: ReviewStatus.PENDING,
      toStatus: ReviewStatus.APPROVED,
      actedByUserId: adminUserId,
      note: dto.note
    });

    return saved;
  }

  async reject(id: string, adminUserId: string, dto: ReviewRequestDto) {
    const claim = await this.claimsRepository.findOne({ where: { id } });
    if (!claim) {
      throw new NotFoundException("Solicitação de reivindicação não encontrada.");
    }
    if (claim.status !== ReviewStatus.PENDING) {
      throw new BadRequestException("Apenas solicitações pendentes podem ser rejeitadas.");
    }

    claim.status = ReviewStatus.REJECTED;
    claim.reviewedByUserId = adminUserId;
    claim.reviewedAt = new Date();
    const saved = await this.claimsRepository.save(claim);

    await this.createHistory({
      entityId: claim.id,
      fromStatus: ReviewStatus.PENDING,
      toStatus: ReviewStatus.REJECTED,
      actedByUserId: adminUserId,
      note: dto.note
    });

    return saved;
  }

  history(claimId: string) {
    return this.statusHistoryRepository.find({
      where: { entityType: "profile_claim_request", entityId: claimId },
      order: { createdAt: "ASC" }
    });
  }
}
