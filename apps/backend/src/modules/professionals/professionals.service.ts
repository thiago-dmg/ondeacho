import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListingsFilterDto } from "../listings/dto/listings-filter.dto";
import { ProfessionalEntity } from "./entities/professional.entity";

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(ProfessionalEntity)
    private readonly professionalsRepository: Repository<ProfessionalEntity>
  ) {}

  async findAll(filters: ListingsFilterDto) {
    const qb = this.professionalsRepository
      .createQueryBuilder("professional")
      .leftJoinAndSelect("professional.specialties", "specialty")
      .leftJoinAndSelect("professional.insurances", "insurance")
      .leftJoinAndSelect("professional.clinic", "clinic");

    if (filters.city) {
      qb.andWhere("LOWER(professional.city) = LOWER(:city)", { city: filters.city });
    }
    if (filters.online !== undefined) {
      qb.andWhere("professional.acceptsOnline = :online", { online: filters.online });
    }
    if (filters.minRating !== undefined) {
      qb.andWhere("professional.rating >= :minRating", { minRating: filters.minRating });
    }
    if (filters.specialtyId) {
      qb.andWhere("specialty.id = :specialtyId", { specialtyId: filters.specialtyId });
    }
    if (filters.insuranceId) {
      qb.andWhere("insurance.id = :insuranceId", { insuranceId: filters.insuranceId });
    }

    return qb.orderBy("professional.rating", "DESC").getMany();
  }
}
