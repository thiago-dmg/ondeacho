import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InsuranceEntity } from "./entities/insurance.entity";
import { SpecialtyEntity } from "./entities/specialty.entity";
import { CatalogController } from "./catalog.controller";

@Module({
  imports: [TypeOrmModule.forFeature([SpecialtyEntity, InsuranceEntity])],
  controllers: [CatalogController]
})
export class CatalogModule {}
