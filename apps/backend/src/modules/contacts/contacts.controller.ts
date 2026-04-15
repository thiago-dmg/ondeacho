import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ContactsService } from "./contacts.service";
import { CreateContactDto } from "./dto/create-contact.dto";

@ApiTags("contacts")
@ApiBearerAuth()
@Controller("contacts")
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateContactDto) {
    return this.contactsService.create(user.sub, dto);
  }

  @Get("mine")
  listMine(@CurrentUser() user: { sub: string }) {
    return this.contactsService.listMine(user.sub);
  }
}
