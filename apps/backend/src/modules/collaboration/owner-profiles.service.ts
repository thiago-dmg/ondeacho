import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ClinicEntity } from "../listings/entities/clinic.entity";
import { ProfileOwnerEntity } from "./entities/profile-owner.entity";
import { UpdateOwnedClinicDto } from "./dto/update-owned-clinic.dto";

@Injectable()
export class OwnerProfilesService {
  constructor(
    @InjectRepository(ProfileOwnerEntity)
    private readonly ownersRepository: Repository<ProfileOwnerEntity>,
    @InjectRepository(ClinicEntity)
    private readonly clinicsRepository: Repository<ClinicEntity>
  ) {}

  async updateOwnedClinic(userId: string, clinicId: string, dto: UpdateOwnedClinicDto) {
    const ownership = await this.ownersRepository.findOne({
      where: { userId, clinicId }
    });

    if (!ownership) {
      throw new ForbiddenException("Você não possui permissão para editar este perfil.");
    }

    const clinic = await this.clinicsRepository.findOne({ where: { id: clinicId } });
    if (!clinic) {
      throw new NotFoundException("Clínica não encontrada.");
    }

    if (dto.name !== undefined) clinic.name = dto.name.trim();
    if (dto.addressLine !== undefined) clinic.addressLine = dto.addressLine.trim() || null;
    if (dto.phone !== undefined) clinic.phone = dto.phone.trim() || null;
    if (dto.whatsappPhone !== undefined) clinic.whatsappPhone = dto.whatsappPhone.trim() || null;

    return this.clinicsRepository.save(clinic);
  }
}
