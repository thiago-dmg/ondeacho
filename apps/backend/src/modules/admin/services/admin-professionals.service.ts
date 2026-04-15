import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { InsuranceEntity } from "../../catalog/entities/insurance.entity";
import { SpecialtyEntity } from "../../catalog/entities/specialty.entity";
import { ProfessionalEntity } from "../../professionals/entities/professional.entity";
import { UpsertProfessionalDto } from "../dto/upsert-professional.dto";

@Injectable()
export class AdminProfessionalsService {
  constructor(
    @InjectRepository(ProfessionalEntity)
    private readonly professionalsRepository: Repository<ProfessionalEntity>,
    @InjectRepository(SpecialtyEntity)
    private readonly specialtiesRepository: Repository<SpecialtyEntity>,
    @InjectRepository(InsuranceEntity)
    private readonly insurancesRepository: Repository<InsuranceEntity>
  ) {}

  list() {
    return this.professionalsRepository.find({
      relations: { specialties: true, insurances: true, clinic: true },
      order: { createdAt: "DESC" }
    });
  }

  async create(dto: UpsertProfessionalDto) {
    const specialties = dto.specialtyIds?.length
      ? await this.specialtiesRepository.findBy({ id: In(dto.specialtyIds) })
      : [];
    const insurances = dto.insuranceIds?.length
      ? await this.insurancesRepository.findBy({ id: In(dto.insuranceIds) })
      : [];

    const entity = this.professionalsRepository.create({
      ...dto,
      clinicId: dto.clinicId ?? null,
      neighborhood: dto.neighborhood ?? null,
      acceptsOnline: dto.acceptsOnline ?? false,
      supportsTeaTdh: dto.supportsTeaTdh ?? true,
      rating: dto.rating ?? 0,
      specialties,
      insurances
    });
    return this.professionalsRepository.save(entity);
  }

  async update(id: string, dto: UpsertProfessionalDto) {
    const entity = await this.professionalsRepository.findOne({
      where: { id },
      relations: { specialties: true, insurances: true }
    });
    if (!entity) throw new NotFoundException("Profissional não encontrado.");
    Object.assign(entity, {
      ...dto,
      clinicId: dto.clinicId ?? entity.clinicId,
      neighborhood: dto.neighborhood ?? entity.neighborhood
    });
    if (dto.specialtyIds) {
      entity.specialties = await this.specialtiesRepository.findBy({ id: In(dto.specialtyIds) });
    }
    if (dto.insuranceIds) {
      entity.insurances = await this.insurancesRepository.findBy({ id: In(dto.insuranceIds) });
    }
    return this.professionalsRepository.save(entity);
  }

  async remove(id: string) {
    const entity = await this.professionalsRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException("Profissional não encontrado.");
    await this.professionalsRepository.delete(id);
    return { success: true };
  }
}
