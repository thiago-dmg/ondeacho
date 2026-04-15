import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { ListingsModule } from "./listings/listings.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { AdminModule } from "./admin/admin.module";
import { CatalogModule } from "./catalog/catalog.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { ContactsModule } from "./contacts/contacts.module";
import { ProfessionalsModule } from "./professionals/professionals.module";
import { HealthModule } from "./health/health.module";
import { UserEntity } from "./users/entities/user.entity";
import { ClinicEntity } from "./listings/entities/clinic.entity";
import { ReviewEntity } from "./reviews/entities/review.entity";
import { SpecialtyEntity } from "./catalog/entities/specialty.entity";
import { InsuranceEntity } from "./catalog/entities/insurance.entity";
import { ProfessionalEntity } from "./professionals/entities/professional.entity";
import { FavoriteEntity } from "./favorites/entities/favorite.entity";
import { ContactEntity } from "./contacts/entities/contact.entity";
import { CollaborationModule } from "./collaboration/collaboration.module";
import { ClinicSuggestionEntity } from "./collaboration/entities/clinic-suggestion.entity";
import { ProfileClaimRequestEntity } from "./collaboration/entities/profile-claim-request.entity";
import { ProfileOwnerEntity } from "./collaboration/entities/profile-owner.entity";
import { StatusHistoryEntity } from "./collaboration/entities/status-history.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? "postgres",
      password: process.env.DB_PASSWORD ?? "postgres",
      database: process.env.DB_NAME ?? "ondeacho",
      entities: [
        UserEntity,
        ClinicEntity,
        ReviewEntity,
        SpecialtyEntity,
        InsuranceEntity,
        ProfessionalEntity,
        FavoriteEntity,
        ContactEntity,
        ClinicSuggestionEntity,
        ProfileClaimRequestEntity,
        ProfileOwnerEntity,
        StatusHistoryEntity
      ],
      synchronize: false
    }),
    AuthModule,
    ListingsModule,
    ReviewsModule,
    AdminModule,
    CatalogModule,
    FavoritesModule,
    ContactsModule,
    ProfessionalsModule,
    HealthModule,
    CollaborationModule
  ]
})
export class AppModule {}
