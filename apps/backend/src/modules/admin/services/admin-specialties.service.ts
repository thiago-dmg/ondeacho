import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SpecialtyEntity } from "../../catalog/entities/specialty.entity";
import { UpsertSpecialtyDto } from "../dto/upsert-specialty.dto";

@Injectable()
export class AdminSpecialtiesService {
  constructor(
    @InjectRepository(SpecialtyEntity)
    private readonly specialtiesRepository: Repository<SpecialtyEntity>
  ) {}

  list() {
    return this.specialtiesRepository.find({ order: { name: "ASC" } });
  }

  create(dto: UpsertSpecialtyDto) {
    const entity = this.specialtiesRepository.create(dto);
    return this.specialtiesRepository.save(entity);
  }

  async update(id: string, dto: UpsertSpecialtyDto) {
    const entity = await this.specialtiesRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException("Especialidade não encontrada.");
    Object.assign(entity, dto);
    return this.specialtiesRepository.save(entity);
  }

  async remove(id: string) {
    const entity = await this.specialtiesRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException("Especialidade não encontrada.");
    await this.specialtiesRepository.delete(id);
    return { success: true };
  }
}
