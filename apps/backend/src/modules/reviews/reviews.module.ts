import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { ReviewEntity } from "./entities/review.entity";
import { ClinicEntity } from "../listings/entities/clinic.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity, ClinicEntity])],
  controllers: [ReviewsController],
  providers: [ReviewsService]
})
export class ReviewsModule {}
