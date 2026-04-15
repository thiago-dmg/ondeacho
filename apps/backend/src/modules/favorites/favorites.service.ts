import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ClinicEntity } from "../listings/entities/clinic.entity";
import { CreateFavoriteDto } from "./dto/create-favorite.dto";
import { FavoriteEntity } from "./entities/favorite.entity";

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly favoritesRepository: Repository<FavoriteEntity>,
    @InjectRepository(ClinicEntity)
    private readonly clinicsRepository: Repository<ClinicEntity>
  ) {}

  async list(userId: string) {
    return this.favoritesRepository.find({
      where: { userId },
      relations: { clinic: true },
      order: { createdAt: "DESC" }
    });
  }

  async create(userId: string, dto: CreateFavoriteDto) {
    const clinic = await this.clinicsRepository.findOne({ where: { id: dto.clinicId } });
    if (!clinic) {
      throw new NotFoundException("Clínica não encontrada.");
    }

    const existing = await this.favoritesRepository.findOne({
      where: { userId, clinicId: dto.clinicId }
    });
    if (existing) {
      throw new BadRequestException("Clínica já está nos favoritos.");
    }

    const favorite = this.favoritesRepository.create({
      userId,
      clinicId: dto.clinicId
    });
    return this.favoritesRepository.save(favorite);
  }

  async remove(userId: string, clinicId: string) {
    const favorite = await this.favoritesRepository.findOne({ where: { userId, clinicId } });
    if (!favorite) {
      throw new NotFoundException("Favorito não encontrado.");
    }
    await this.favoritesRepository.delete(favorite.id);
    return { success: true };
  }
}
