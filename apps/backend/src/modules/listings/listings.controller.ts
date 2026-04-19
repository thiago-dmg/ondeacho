import { Controller, Get, Headers, Param, Query } from "@nestjs/common";
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

  /** `Authorization: Bearer` opcional: quando válido, inclui `viewerIsOwner` para a UI permitir edição só ao proprietário. */
  @Get(":id")
  findOne(@Param("id") id: string, @Headers("authorization") authorization?: string) {
    return this.listingsService.findOne(id, authorization);
  }
}
