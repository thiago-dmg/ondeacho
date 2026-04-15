import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ListingsService } from "./listings.service";
import { ListingsFilterDto } from "./dto/listings-filter.dto";

@ApiTags("listings")
@Controller("listings")
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findAll(@Query() query: ListingsFilterDto) {
    return this.listingsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.listingsService.findOne(id);
  }
}
