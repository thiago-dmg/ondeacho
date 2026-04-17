import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsIn } from "class-validator";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/enums/role.enum";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { AdminReviewsService } from "../services/admin-reviews.service";

class ModerateReviewDto {
  @IsIn(["approved", "rejected"])
  status!: "approved" | "rejected";
}

@ApiTags("admin/reviews")
@ApiBearerAuth()
@Controller("admin/reviews")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminReviewsController {
  constructor(private readonly adminReviewsService: AdminReviewsService) {}

  @Get()
  list() {
    return this.adminReviewsService.list();
  }

  @Patch(":id/moderate")
  moderate(@Param("id") id: string, @Body() dto: ModerateReviewDto) {
    return this.adminReviewsService.moderate(id, dto.status);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminReviewsService.remove(id);
  }
}
