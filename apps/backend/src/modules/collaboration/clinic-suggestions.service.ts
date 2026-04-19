import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { InsuranceEntity } from "../catalog/entities/insurance.entity";
import { SpecialtyEntity } from "../catalog/entities/specialty.entity";
import { ClinicEntity } from "../listings/entities/clinic.entity";
import { UserEntity } from "../users/entities/user.entity";
import { CreateClinicSuggestionDto } from "./dto/create-clinic-suggestion.dto";
import { ClinicSuggestionEntity } from "./entities/clinic-suggestion.entity";
import { ReviewStatus } from "./enums/review-status.enum";
import { SuggestionTargetType } from "./enums/suggestion-target-type.enum";

function splitCommaList(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function uniquePreserveOrder(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const k = item.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

@Injectable()
export class ClinicSuggestionsService {
  constructor(
    @InjectRepository(ClinicSuggestionEntity)
    private readonly suggestionsRepository: Repository<ClinicSuggestionEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(SpecialtyEntity)
    private readonly specialtiesRepository: Repository<SpecialtyEntity>,
    @InjectRepository(InsuranceEntity)
    private readonly insurancesRepository: Repository<InsuranceEntity>,
    @InjectRepository(ClinicEntity)
    private readonly clinicsRepository: Repository<ClinicEntity>
  ) {}

  async create(userId: string, dto: CreateClinicSuggestionDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException("Usuário inválido para sugestão.");
    }

    const specialtyIds = [...new Set((dto.specialtyIds ?? []).filter(Boolean))];
    const insuranceIds = [...new Set((dto.insuranceIds ?? []).filter(Boolean))];

    const specialties =
      specialtyIds.length > 0
        ? await this.specialtiesRepository.find({ where: { id: In(specialtyIds) } })
        : [];
    if (specialties.length !== specialtyIds.length) {
      throw new BadRequestException("Uma ou mais especialidades são inválidas.");
    }

    const insurances =
      insuranceIds.length > 0
        ? await this.insurancesRepository.find({ where: { id: In(insuranceIds) } })
        : [];
    if (insurances.length !== insuranceIds.length) {
      throw new BadRequestException("Um ou mais convênios são inválidos.");
    }

    const namesFromSpecialtyIds = specialties.map((s) => s.name);
    const namesFromSpecialtyOther = splitCommaList(dto.specialtyOther);
    const legacySpecialtyNames = dto.specialtyNames?.map((s) => s.trim()).filter(Boolean) ?? [];
    const specialtyNames = uniquePreserveOrder([
      ...namesFromSpecialtyIds,
      ...namesFromSpecialtyOther,
      ...legacySpecialtyNames
    ]);

    const namesFromInsuranceIds = insurances.map((i) => i.name);
    const namesFromInsuranceOther = splitCommaList(dto.insuranceOther);
    const legacyInsuranceNames = dto.insuranceNames?.map((s) => s.trim()).filter(Boolean) ?? [];
    const insuranceNames = uniquePreserveOrder([
      ...namesFromInsuranceIds,
      ...namesFromInsuranceOther,
      ...legacyInsuranceNames
    ]);

    let linkedClinicId: string | null = null;
    let linkedClinicName: string | null = null;
    if (dto.targetType === SuggestionTargetType.PROFESSIONAL) {
      if (dto.linkedClinicId) {
        const clinic = await this.clinicsRepository.findOne({ where: { id: dto.linkedClinicId } });
        if (!clinic) {
          throw new BadRequestException("Clínica inválida.");
        }
        linkedClinicId = dto.linkedClinicId;
        linkedClinicName = null;
      } else {
        linkedClinicName = dto.linkedClinicName?.trim() || null;
      }
    }

    const specialtyOtherStored = dto.specialtyOther?.trim() || null;
    const insuranceOtherStored = dto.insuranceOther?.trim() || null;

    const suggestion = this.suggestionsRepository.create({
      suggestedByUserId: userId,
      suggestedByName: user.name,
      targetType: dto.targetType,
      name: dto.name.trim(),
      city: dto.city.trim(),
      neighborhood: dto.neighborhood?.trim() || null,
      addressLine: dto.addressLine?.trim() || null,
      linkedClinicId,
      linkedClinicName,
      professionalCrm:
        dto.targetType === SuggestionTargetType.PROFESSIONAL ? dto.professionalCrm?.trim() || null : null,
      professionalAttendance: null,
      phone: dto.phone?.trim() || null,
      whatsappPhone: dto.whatsappPhone?.trim() || null,
      specialtyIds,
      specialtyOther: specialtyOtherStored,
      insuranceIds,
      insuranceOther: insuranceOtherStored,
      specialtyNames,
      insuranceNames,
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
