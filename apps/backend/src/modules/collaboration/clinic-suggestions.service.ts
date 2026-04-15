import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../users/entities/user.entity";
import { CreateClinicSuggestionDto } from "./dto/create-clinic-suggestion.dto";
import { ClinicSuggestionEntity } from "./entities/clinic-suggestion.entity";
import { ReviewStatus } from "./enums/review-status.enum";

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

    const suggestion = this.suggestionsRepository.create({
      suggestedByUserId: userId,
      suggestedByName: user.name,
      targetType: dto.targetType,
      name: dto.name.trim(),
      city: dto.city.trim(),
      neighborhood: dto.neighborhood?.trim() || null,
      addressLine: dto.addressLine?.trim() || null,
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
