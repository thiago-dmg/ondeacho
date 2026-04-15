import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/enums/role.enum";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { UpsertProfessionalDto } from "../dto/upsert-professional.dto";
import { AdminProfessionalsService } from "../services/admin-professionals.service";

@ApiTags("admin/professionals")
@ApiBearerAuth()
@Controller("admin/professionals")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminProfessionalsController {
  constructor(private readonly adminProfessionalsService: AdminProfessionalsService) {}

  @Get()
  list() {
    return this.adminProfessionalsService.list();
  }

  @Post()
  create(@Body() dto: UpsertProfessionalDto) {
    return this.adminProfessionalsService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpsertProfessionalDto) {
    return this.adminProfessionalsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminProfessionalsService.remove(id);
  }
}
