import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClinicEntity } from "../listings/entities/clinic.entity";
import { FavoritesController } from "./favorites.controller";
import { FavoriteEntity } from "./entities/favorite.entity";
import { FavoritesService } from "./favorites.service";

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteEntity, ClinicEntity])],
  controllers: [FavoritesController],
  providers: [FavoritesService]
})
export class FavoritesModule {}
