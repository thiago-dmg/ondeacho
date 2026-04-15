import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateClinicSuggestionDto } from "./dto/create-clinic-suggestion.dto";
import { ClinicSuggestionsService } from "./clinic-suggestions.service";

@ApiTags("clinic-suggestions")
@ApiBearerAuth()
@Controller("clinic-suggestions")
@UseGuards(JwtAuthGuard)
export class ClinicSuggestionsController {
  constructor(private readonly clinicSuggestionsService: ClinicSuggestionsService) {}

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateClinicSuggestionDto) {
    return this.clinicSuggestionsService.create(user.sub, dto);
  }

  @Get("mine")
  listMine(@CurrentUser() user: { sub: string }) {
    return this.clinicSuggestionsService.listMine(user.sub);
  }
}
