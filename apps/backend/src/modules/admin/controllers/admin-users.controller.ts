import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../common/decorators/roles.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Role } from "../../../common/enums/role.enum";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { AdminUpdateUserDto } from "../dto/admin-user.dto";
import { AdminUsersService } from "../services/admin-users.service";

@ApiTags("admin/users")
@ApiBearerAuth()
@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  list(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("q") q?: string
  ) {
    return this.adminUsersService.list(Number(page) || 1, Number(limit) || 20, q);
  }

  @Patch(":id")
  update(
    @CurrentUser() actor: { sub: string },
    @Param("id") id: string,
    @Body() dto: AdminUpdateUserDto
  ) {
    return this.adminUsersService.update(actor.sub, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() actor: { sub: string }, @Param("id") id: string) {
    return this.adminUsersService.remove(actor.sub, id);
  }
}
