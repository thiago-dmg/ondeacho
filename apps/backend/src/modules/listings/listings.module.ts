import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ListingsController } from "./listings.controller";
import { ListingsService } from "./listings.service";
import { ClinicEntity } from "./entities/clinic.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ClinicEntity])],
  controllers: [ListingsController],
  providers: [ListingsService]
})
export class ListingsModule {}
