import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/enums/role.enum";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { UpsertClinicDto } from "../dto/upsert-clinic.dto";
import { AdminClinicsService } from "../services/admin-clinics.service";

@ApiTags("admin/clinics")
@ApiBearerAuth()
@Controller("admin/clinics")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminClinicsController {
  constructor(private readonly adminClinicsService: AdminClinicsService) {}

  @Get()
  list(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("q") q?: string,
    @Query("minCommunityRating") minCommunityRating?: string,
    @Query("maxCommunityRating") maxCommunityRating?: string
  ) {
    return this.adminClinicsService.list(
      Number(page) || 1,
      Number(limit) || 25,
      q,
      minCommunityRating,
      maxCommunityRating
    );
  }

  @Post()
  create(@Body() dto: UpsertClinicDto) {
    return this.adminClinicsService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpsertClinicDto) {
    return this.adminClinicsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminClinicsService.remove(id);
  }
}
