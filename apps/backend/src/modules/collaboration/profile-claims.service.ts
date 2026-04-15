import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ClinicEntity } from "../listings/entities/clinic.entity";
import { ProfessionalEntity } from "../professionals/entities/professional.entity";
import { CreateProfileClaimDto } from "./dto/create-profile-claim.dto";
import { ProfileClaimRequestEntity } from "./entities/profile-claim-request.entity";
import { ReviewStatus } from "./enums/review-status.enum";

@Injectable()
export class ProfileClaimsService {
  constructor(
    @InjectRepository(ProfileClaimRequestEntity)
    private readonly claimsRepository: Repository<ProfileClaimRequestEntity>,
    @InjectRepository(ClinicEntity)
    private readonly clinicsRepository: Repository<ClinicEntity>,
    @InjectRepository(ProfessionalEntity)
    private readonly professionalsRepository: Repository<ProfessionalEntity>
  ) {}

  async create(userId: string, dto: CreateProfileClaimDto) {
    if (!dto.clinicId && !dto.professionalId) {
      throw new BadRequestException("Informe clinicId ou professionalId.");
    }

    if (dto.clinicId && dto.professionalId) {
      throw new BadRequestException("Informe somente clinicId ou professionalId.");
    }

    if (dto.clinicId) {
      const clinic = await this.clinicsRepository.findOne({ where: { id: dto.clinicId } });
      if (!clinic) {
        throw new BadRequestException("Clínica não encontrada.");
      }
    }

    if (dto.professionalId) {
      const professional = await this.professionalsRepository.findOne({
        where: { id: dto.professionalId }
      });
      if (!professional) {
        throw new BadRequestException("Profissional não encontrado.");
      }
    }

    const claim = this.claimsRepository.create({
      requesterUserId: userId,
      clinicId: dto.clinicId ?? null,
      professionalId: dto.professionalId ?? null,
      requesterName: dto.requesterName.trim(),
      requesterEmail: dto.requesterEmail.trim().toLowerCase(),
      requesterPhone: dto.requesterPhone.trim(),
      message: dto.message?.trim() || null,
      status: ReviewStatus.PENDING
    });

    return this.claimsRepository.save(claim);
  }

  listMine(userId: string) {
    return this.claimsRepository.find({
      where: { requesterUserId: userId },
      order: { createdAt: "DESC" }
    });
  }
}
