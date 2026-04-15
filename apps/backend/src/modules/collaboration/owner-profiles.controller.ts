import { Body, Controller, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateOwnedClinicDto } from "./dto/update-owned-clinic.dto";
import { OwnerProfilesService } from "./owner-profiles.service";

@ApiTags("owner/profiles")
@ApiBearerAuth()
@Controller("owner/profiles")
@UseGuards(JwtAuthGuard)
export class OwnerProfilesController {
  constructor(private readonly ownerProfilesService: OwnerProfilesService) {}

  @Patch("clinics/:clinicId")
  updateOwnedClinic(
    @CurrentUser() user: { sub: string },
    @Param("clinicId") clinicId: string,
    @Body() dto: UpdateOwnedClinicDto
  ) {
    return this.ownerProfilesService.updateOwnedClinic(user.sub, clinicId, dto);
  }
}
