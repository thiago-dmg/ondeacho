import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReviewEntity } from "../../reviews/entities/review.entity";

@Injectable()
export class AdminReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewsRepository: Repository<ReviewEntity>
  ) {}

  list() {
    return this.reviewsRepository.find({ order: { createdAt: "DESC" } });
  }

  async moderate(id: string, status: "approved" | "rejected") {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException("Avaliação não encontrada.");
    review.status = status;
    return this.reviewsRepository.save(review);
  }
}
