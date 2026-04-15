import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClinicEntity } from "../listings/entities/clinic.entity";
import { AdminClinicsController } from "./controllers/admin-clinics.controller";
import { AdminClinicsService } from "./services/admin-clinics.service";
import { SpecialtyEntity } from "../catalog/entities/specialty.entity";
import { InsuranceEntity } from "../catalog/entities/insurance.entity";
import { ProfessionalEntity } from "../professionals/entities/professional.entity";
import { ReviewEntity } from "../reviews/entities/review.entity";
import { UserEntity } from "../users/entities/user.entity";
import { FavoriteEntity } from "../favorites/entities/favorite.entity";
import { ContactEntity } from "../contacts/entities/contact.entity";
import { AdminSpecialtiesService } from "./services/admin-specialties.service";
import { AdminInsurancesService } from "./services/admin-insurances.service";
import { AdminProfessionalsService } from "./services/admin-professionals.service";
import { AdminReviewsService } from "./services/admin-reviews.service";
import { AdminSpecialtiesController } from "./controllers/admin-specialties.controller";
import { AdminInsurancesController } from "./controllers/admin-insurances.controller";
import { AdminProfessionalsController } from "./controllers/admin-professionals.controller";
import { AdminReviewsController } from "./controllers/admin-reviews.controller";
import { AdminMetricsController } from "./controllers/admin-metrics.controller";
import { AdminMetricsService } from "./services/admin-metrics.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClinicEntity,
      SpecialtyEntity,
      InsuranceEntity,
      ProfessionalEntity,
      ReviewEntity,
      UserEntity,
      FavoriteEntity,
      ContactEntity
    ])
  ],
  controllers: [
    AdminClinicsController,
    AdminSpecialtiesController,
    AdminInsurancesController,
    AdminProfessionalsController,
    AdminReviewsController,
    AdminMetricsController
  ],
  providers: [
    AdminClinicsService,
    AdminSpecialtiesService,
    AdminInsurancesService,
    AdminProfessionalsService,
    AdminReviewsService,
    AdminMetricsService
  ]
})
export class AdminModule {}
