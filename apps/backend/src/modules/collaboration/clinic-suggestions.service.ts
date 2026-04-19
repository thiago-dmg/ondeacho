import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../users/entities/user.entity";
import { CreateClinicSuggestionDto } from "./dto/create-clinic-suggestion.dto";
import { ClinicSuggestionEntity } from "./entities/clinic-suggestion.entity";
import { ProfessionalSuggestionAttendance } from "./enums/professional-suggestion-attendance.enum";
import { ReviewStatus } from "./enums/review-status.enum";
import { SuggestionTargetType } from "./enums/suggestion-target-type.enum";

@Injectable()
export class ClinicSuggestionsService {
  constructor(
    @InjectRepository(ClinicSuggestionEntity)
    private readonly suggestionsRepository: Repository<ClinicSuggestionEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {}

  async create(userId: string, dto: CreateClinicSuggestionDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException("Usuário inválido para sugestão.");
    }

    let addressLine = dto.addressLine?.trim() || null;
    let linkedClinicName = dto.linkedClinicName?.trim() || null;
    let professionalCrm = dto.professionalCrm?.trim() || null;
    let professionalAttendance = dto.professionalAttendance ?? null;

    if (dto.targetType === SuggestionTargetType.CLINIC) {
      linkedClinicName = null;
      professionalCrm = null;
      professionalAttendance = null;
    } else {
      if (!professionalAttendance) {
        professionalAttendance = ProfessionalSuggestionAttendance.OTHER_LOCATION;
      }
      if (professionalAttendance === ProfessionalSuggestionAttendance.AT_CLINIC) {
        addressLine = null;
      }
    }

    const suggestion = this.suggestionsRepository.create({
      suggestedByUserId: userId,
      suggestedByName: user.name,
      targetType: dto.targetType,
      name: dto.name.trim(),
      city: dto.city.trim(),
      neighborhood: dto.neighborhood?.trim() || null,
      addressLine,
      linkedClinicName,
      professionalCrm,
      professionalAttendance,
      phone: dto.phone?.trim() || null,
      whatsappPhone: dto.whatsappPhone?.trim() || null,
      specialtyNames: dto.specialtyNames?.map((item) => item.trim()).filter(Boolean) ?? [],
      insuranceNames: dto.insuranceNames?.map((item) => item.trim()).filter(Boolean) ?? [],
      observations: dto.observations?.trim() || null,
      status: ReviewStatus.PENDING
    });

    return this.suggestionsRepository.save(suggestion);
  }

  listMine(userId: string) {
    return this.suggestionsRepository.find({
      where: { suggestedByUserId: userId },
      order: { createdAt: "DESC" }
    });
  }
}
