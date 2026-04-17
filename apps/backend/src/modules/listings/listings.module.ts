import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ListingsController } from "./listings.controller";
import { ListingsService } from "./listings.service";
import { ClinicEntity } from "./entities/clinic.entity";
import { ProfessionalEntity } from "../professionals/entities/professional.entity";
import { ReviewEntity } from "../reviews/entities/review.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ClinicEntity, ProfessionalEntity, ReviewEntity])],
  controllers: [ListingsController],
  providers: [ListingsService]
})
export class ListingsModule {}
