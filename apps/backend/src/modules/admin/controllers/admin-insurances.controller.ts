import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/enums/role.enum";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { UpsertInsuranceDto } from "../dto/upsert-insurance.dto";
import { AdminInsurancesService } from "../services/admin-insurances.service";

@ApiTags("admin/insurances")
@ApiBearerAuth()
@Controller("admin/insurances")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminInsurancesController {
  constructor(private readonly adminInsurancesService: AdminInsurancesService) {}

  @Get()
  list() {
    return this.adminInsurancesService.list();
  }

  @Post()
  create(@Body() dto: UpsertInsuranceDto) {
    return this.adminInsurancesService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpsertInsuranceDto) {
    return this.adminInsurancesService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminInsurancesService.remove(id);
  }
}
