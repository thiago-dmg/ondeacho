import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewsService } from "./reviews.service";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: { sub: string }) {
    return this.reviewsService.create(dto, user.sub);
  }

  @Get("listing/:listingId/summary")
  getSummary(@Param("listingId") listingId: string) {
    return this.reviewsService.getSummary(listingId);
  }

  @Get("listing/:listingId")
  findByListing(@Param("listingId") listingId: string) {
    return this.reviewsService.findByListing(listingId);
  }
}
