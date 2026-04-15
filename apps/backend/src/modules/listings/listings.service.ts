import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListingsFilterDto } from "./dto/listings-filter.dto";
import { ClinicEntity } from "./entities/clinic.entity";

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(ClinicEntity)
    private readonly clinicsRepository: Repository<ClinicEntity>
  ) {}

  async findAll(filters: ListingsFilterDto) {
    const qb = this.clinicsRepository
      .createQueryBuilder("clinic")
      .leftJoinAndSelect("clinic.specialties", "specialty")
      .leftJoinAndSelect("clinic.insurances", "insurance");

    if (filters.city) {
      qb.andWhere("LOWER(clinic.city) = LOWER(:city)", { city: filters.city });
    }
    if (filters.online !== undefined) {
      qb.andWhere("clinic.acceptsOnline = :online", { online: filters.online });
    }
    if (filters.minRating !== undefined) {
      qb.andWhere("clinic.rating >= :minRating", { minRating: filters.minRating });
    }
    if (filters.specialtyId) {
      qb.andWhere("specialty.id = :specialtyId", { specialtyId: filters.specialtyId });
    }
    if (filters.insuranceId) {
      qb.andWhere("insurance.id = :insuranceId", { insuranceId: filters.insuranceId });
    }

    return qb.orderBy("clinic.rating", "DESC").getMany();
  }

  async findOne(id: string) {
    const clinic = await this.clinicsRepository.findOne({
      where: { id },
      relations: { specialties: true, insurances: true }
    });
    if (!clinic) {
      throw new NotFoundException("Clínica não encontrada.");
    }
    return clinic;
  }
}
