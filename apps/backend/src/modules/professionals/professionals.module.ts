import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfessionalEntity } from "./entities/professional.entity";
import { ProfessionalsController } from "./professionals.controller";
import { ProfessionalsService } from "./professionals.service";

@Module({
  imports: [TypeOrmModule.forFeature([ProfessionalEntity])],
  controllers: [ProfessionalsController],
  providers: [ProfessionalsService]
})
export class ProfessionalsModule {}
