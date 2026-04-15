import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ListingsFilterDto } from "../listings/dto/listings-filter.dto";
import { ProfessionalsService } from "./professionals.service";

@ApiTags("professionals")
@Controller("professionals")
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get()
  findAll(@Query() query: ListingsFilterDto) {
    return this.professionalsService.findAll(query);
  }
}
