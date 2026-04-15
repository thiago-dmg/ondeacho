import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ClinicEntity } from "../listings/entities/clinic.entity";
import { CreateContactDto } from "./dto/create-contact.dto";
import { ContactEntity } from "./entities/contact.entity";

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ContactEntity)
    private readonly contactsRepository: Repository<ContactEntity>,
    @InjectRepository(ClinicEntity)
    private readonly clinicsRepository: Repository<ClinicEntity>
  ) {}

  async create(userId: string, dto: CreateContactDto) {
    const clinic = await this.clinicsRepository.findOne({ where: { id: dto.clinicId } });
    if (!clinic) throw new NotFoundException("Clínica não encontrada.");

    const contact = this.contactsRepository.create({
      userId,
      clinicId: dto.clinicId,
      message: dto.message ?? null,
      preferredChannel: dto.preferredChannel
    });
    return this.contactsRepository.save(contact);
  }

  listMine(userId: string) {
    return this.contactsRepository.find({
      where: { userId },
      relations: { clinic: true },
      order: { createdAt: "DESC" }
    });
  }
}
