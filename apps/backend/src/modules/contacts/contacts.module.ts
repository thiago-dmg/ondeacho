import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClinicEntity } from "../listings/entities/clinic.entity";
import { ContactEntity } from "./entities/contact.entity";
import { ContactsController } from "./contacts.controller";
import { ContactsService } from "./contacts.service";

@Module({
  imports: [TypeOrmModule.forFeature([ContactEntity, ClinicEntity])],
  controllers: [ContactsController],
  providers: [ContactsService]
})
export class ContactsModule {}
