import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClinicEntity } from "../listings/entities/clinic.entity";
import { ProfessionalEntity } from "../professionals/entities/professional.entity";
import { UserEntity } from "../users/entities/user.entity";
import { ClinicSuggestionsController } from "./clinic-suggestions.controller";
import { ClinicSuggestionsService } from "./clinic-suggestions.service";
import { ClinicSuggestionEntity } from "./entities/clinic-suggestion.entity";
import { ProfileClaimRequestEntity } from "./entities/profile-claim-request.entity";
import { ProfileOwnerEntity } from "./entities/profile-owner.entity";
import { StatusHistoryEntity } from "./entities/status-history.entity";
import { OwnerProfilesController } from "./owner-profiles.controller";
import { OwnerProfilesService } from "./owner-profiles.service";
import { ProfileClaimsController } from "./profile-claims.controller";
import { ProfileClaimsService } from "./profile-claims.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ClinicEntity,
      ProfessionalEntity,
      ClinicSuggestionEntity,
      ProfileClaimRequestEntity,
      ProfileOwnerEntity,
      StatusHistoryEntity
    ])
  ],
  controllers: [ClinicSuggestionsController, ProfileClaimsController, OwnerProfilesController],
  providers: [ClinicSuggestionsService, ProfileClaimsService, OwnerProfilesService]
})
export class CollaborationModule {}
