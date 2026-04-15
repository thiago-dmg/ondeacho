import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InsuranceEntity } from "./entities/insurance.entity";
import { SpecialtyEntity } from "./entities/specialty.entity";

@ApiTags("catalog")
@Controller("catalog")
export class CatalogController {
  constructor(
    @InjectRepository(SpecialtyEntity)
    private readonly specialtiesRepository: Repository<SpecialtyEntity>,
    @InjectRepository(InsuranceEntity)
    private readonly insurancesRepository: Repository<InsuranceEntity>
  ) {}

  @Get("specialties")
  listSpecialties() {
    return this.specialtiesRepository.find({ order: { name: "ASC" } });
  }

  @Get("insurances")
  listInsurances() {
    return this.insurancesRepository.find({ order: { name: "ASC" } });
  }
}
