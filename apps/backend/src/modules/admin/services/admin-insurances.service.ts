import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InsuranceEntity } from "../../catalog/entities/insurance.entity";
import { UpsertInsuranceDto } from "../dto/upsert-insurance.dto";

@Injectable()
export class AdminInsurancesService {
  constructor(
    @InjectRepository(InsuranceEntity)
    private readonly insurancesRepository: Repository<InsuranceEntity>
  ) {}

  list() {
    return this.insurancesRepository.find({ order: { name: "ASC" } });
  }

  create(dto: UpsertInsuranceDto) {
    const entity = this.insurancesRepository.create(dto);
    return this.insurancesRepository.save(entity);
  }

  async update(id: string, dto: UpsertInsuranceDto) {
    const entity = await this.insurancesRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException("Convênio não encontrado.");
    Object.assign(entity, dto);
    return this.insurancesRepository.save(entity);
  }

  async remove(id: string) {
    const entity = await this.insurancesRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException("Convênio não encontrado.");
    await this.insurancesRepository.delete(id);
    return { success: true };
  }
}
