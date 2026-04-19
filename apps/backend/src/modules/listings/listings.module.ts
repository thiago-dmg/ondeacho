import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { ProfileOwnerEntity } from "../collaboration/entities/profile-owner.entity";
import { ListingsController } from "./listings.controller";
import { ListingsService } from "./listings.service";
import { ClinicEntity } from "./entities/clinic.entity";
import { ProfessionalEntity } from "../professionals/entities/professional.entity";
import { ReviewEntity } from "../reviews/entities/review.entity";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([ClinicEntity, ProfessionalEntity, ReviewEntity, ProfileOwnerEntity])
  ],
  controllers: [ListingsController],
  providers: [ListingsService]
})
export class ListingsModule {}
