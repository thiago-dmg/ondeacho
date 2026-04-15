import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/enums/role.enum";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { ReviewRequestDto } from "../../collaboration/dto/review-request.dto";
import { ReviewStatus } from "../../collaboration/enums/review-status.enum";
import { AdminProfileClaimsService } from "../services/admin-profile-claims.service";

@ApiTags("admin/profile-claims")
@ApiBearerAuth()
@Controller("admin/profile-claims")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminProfileClaimsController {
  constructor(private readonly adminProfileClaimsService: AdminProfileClaimsService) {}

  @Get()
  list(@Query("status") status?: ReviewStatus) {
    return this.adminProfileClaimsService.list(status);
  }

  @Get(":id/history")
  history(@Param("id") id: string) {
    return this.adminProfileClaimsService.history(id);
  }

  @Patch(":id/approve")
  approve(
    @Param("id") id: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: ReviewRequestDto
  ) {
    return this.adminProfileClaimsService.approve(id, user.sub, dto);
  }

  @Patch(":id/reject")
  reject(
    @Param("id") id: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: ReviewRequestDto
  ) {
    return this.adminProfileClaimsService.reject(id, user.sub, dto);
  }
}
