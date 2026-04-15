import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/enums/role.enum";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { ReviewRequestDto } from "../../collaboration/dto/review-request.dto";
import { ReviewStatus } from "../../collaboration/enums/review-status.enum";
import { AdminClinicSuggestionsService } from "../services/admin-clinic-suggestions.service";

@ApiTags("admin/clinic-suggestions")
@ApiBearerAuth()
@Controller("admin/clinic-suggestions")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminClinicSuggestionsController {
  constructor(private readonly adminClinicSuggestionsService: AdminClinicSuggestionsService) {}

  @Get()
  list(@Query("status") status?: ReviewStatus) {
    return this.adminClinicSuggestionsService.list(status);
  }

  @Get(":id/history")
  history(@Param("id") id: string) {
    return this.adminClinicSuggestionsService.history(id);
  }

  @Patch(":id/approve")
  approve(
    @Param("id") id: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: ReviewRequestDto
  ) {
    return this.adminClinicSuggestionsService.approve(id, user.sub, dto);
  }

  @Patch(":id/reject")
  reject(
    @Param("id") id: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: ReviewRequestDto
  ) {
    return this.adminClinicSuggestionsService.reject(id, user.sub, dto);
  }
}
