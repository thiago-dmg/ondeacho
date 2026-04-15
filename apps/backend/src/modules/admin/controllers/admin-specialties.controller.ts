import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/enums/role.enum";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { UpsertSpecialtyDto } from "../dto/upsert-specialty.dto";
import { AdminSpecialtiesService } from "../services/admin-specialties.service";

@ApiTags("admin/specialties")
@ApiBearerAuth()
@Controller("admin/specialties")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminSpecialtiesController {
  constructor(private readonly adminSpecialtiesService: AdminSpecialtiesService) {}

  @Get()
  list() {
    return this.adminSpecialtiesService.list();
  }

  @Post()
  create(@Body() dto: UpsertSpecialtyDto) {
    return this.adminSpecialtiesService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpsertSpecialtyDto) {
    return this.adminSpecialtiesService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminSpecialtiesService.remove(id);
  }
}
