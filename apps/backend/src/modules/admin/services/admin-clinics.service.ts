import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { InsuranceEntity } from "../../catalog/entities/insurance.entity";
import { SpecialtyEntity } from "../../catalog/entities/specialty.entity";
import { ClinicEntity } from "../../listings/entities/clinic.entity";
import { UpsertClinicDto } from "../dto/upsert-clinic.dto";

@Injectable()
export class AdminClinicsService {
  constructor(
    @InjectRepository(ClinicEntity)
    private readonly clinicsRepository: Repository<ClinicEntity>,
    @InjectRepository(SpecialtyEntity)
    private readonly specialtiesRepository: Repository<SpecialtyEntity>,
    @InjectRepository(InsuranceEntity)
    private readonly insurancesRepository: Repository<InsuranceEntity>
  ) {}

  list() {
    return this.clinicsRepository.find({
      relations: { specialties: true, insurances: true },
      order: { createdAt: "DESC" }
    });
  }

  async create(dto: UpsertClinicDto) {
    const specialties = dto.specialtyIds?.length
      ? await this.specialtiesRepository.findBy({ id: In(dto.specialtyIds) })
      : [];
    const insurances = dto.insuranceIds?.length
      ? await this.insurancesRepository.findBy({ id: In(dto.insuranceIds) })
      : [];

    const clinic = this.clinicsRepository.create({
      ...dto,
      description: dto.description ?? null,
      neighborhood: dto.neighborhood ?? null,
      rating: dto.rating ?? 0,
      acceptsOnline: dto.acceptsOnline ?? false,
      supportsTeaTdh: dto.supportsTeaTdh ?? true,
      specialties,
      insurances
    });
    return this.clinicsRepository.save(clinic);
  }

  async update(id: string, dto: UpsertClinicDto) {
    const clinic = await this.clinicsRepository.findOne({
      where: { id },
      relations: { specialties: true, insurances: true }
    });
    if (!clinic) {
      throw new NotFoundException("Clínica não encontrada.");
    }

    Object.assign(clinic, {
      ...dto,
      description: dto.description ?? clinic.description,
      neighborhood: dto.neighborhood ?? clinic.neighborhood
    });

    if (dto.specialtyIds) {
      clinic.specialties = await this.specialtiesRepository.findBy({ id: In(dto.specialtyIds) });
    }
    if (dto.insuranceIds) {
      clinic.insurances = await this.insurancesRepository.findBy({ id: In(dto.insuranceIds) });
    }
    return this.clinicsRepository.save(clinic);
  }

  async remove(id: string) {
    const clinic = await this.clinicsRepository.findOne({ where: { id } });
    if (!clinic) {
      throw new NotFoundException("Clínica não encontrada.");
    }
    await this.clinicsRepository.delete(id);
    return { success: true };
  }
}
