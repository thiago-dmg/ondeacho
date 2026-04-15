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
import { ClinicSuggestionEntity } from "../collaboration/entities/clinic-suggestion.entity";
import { ProfileClaimRequestEntity } from "../collaboration/entities/profile-claim-request.entity";
import { ProfileOwnerEntity } from "../collaboration/entities/profile-owner.entity";
import { StatusHistoryEntity } from "../collaboration/entities/status-history.entity";
import { AdminClinicSuggestionsController } from "./controllers/admin-clinic-suggestions.controller";
import { AdminProfileClaimsController } from "./controllers/admin-profile-claims.controller";
import { AdminClinicSuggestionsService } from "./services/admin-clinic-suggestions.service";
import { AdminProfileClaimsService } from "./services/admin-profile-claims.service";

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
      ContactEntity,
      ClinicSuggestionEntity,
      ProfileClaimRequestEntity,
      ProfileOwnerEntity,
      StatusHistoryEntity
    ])
  ],
  controllers: [
    AdminClinicsController,
    AdminSpecialtiesController,
    AdminInsurancesController,
    AdminProfessionalsController,
    AdminReviewsController,
    AdminMetricsController,
    AdminClinicSuggestionsController,
    AdminProfileClaimsController
  ],
  providers: [
    AdminClinicsService,
    AdminSpecialtiesService,
    AdminInsurancesService,
    AdminProfessionalsService,
    AdminReviewsService,
    AdminMetricsService,
    AdminClinicSuggestionsService,
    AdminProfileClaimsService
  ]
})
export class AdminModule {}
