import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateProfileClaimDto } from "./dto/create-profile-claim.dto";
import { ProfileClaimsService } from "./profile-claims.service";

@ApiTags("profile-claims")
@ApiBearerAuth()
@Controller("profile-claims")
@UseGuards(JwtAuthGuard)
export class ProfileClaimsController {
  constructor(private readonly profileClaimsService: ProfileClaimsService) {}

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateProfileClaimDto) {
    return this.profileClaimsService.create(user.sub, dto);
  }

  @Get("mine")
  listMine(@CurrentUser() user: { sub: string }) {
    return this.profileClaimsService.listMine(user.sub);
  }
}
