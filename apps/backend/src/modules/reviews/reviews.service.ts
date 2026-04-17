import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ClinicEntity } from "../listings/entities/clinic.entity";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewEntity } from "./entities/review.entity";
import { computeAppRating } from "./review-summary.util";

export type ReviewSummaryDto = {
  averageRating: number | null;
  reviewCount: number;
};

export type PublicReviewDto = {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  authorName: string;
};

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewsRepository: Repository<ReviewEntity>,
    @InjectRepository(ClinicEntity)
    private readonly clinicsRepository: Repository<ClinicEntity>
  ) {}

  async create(dto: CreateReviewDto, userId: string) {
    const clinic = await this.clinicsRepository.findOne({ where: { id: dto.clinicId } });
    if (!clinic) {
      throw new BadRequestException("Clínica não encontrada.");
    }

    const duplicated = await this.reviewsRepository.findOne({
      where: { clinicId: dto.clinicId, userId }
    });
    if (duplicated) {
      throw new BadRequestException("Usuário já avaliou este atendimento.");
    }

    const review = this.reviewsRepository.create({
      clinicId: dto.clinicId,
      userId,
      rating: dto.rating,
      comment: dto.comment
    });
    return this.reviewsRepository.save(review);
  }

  async findByListing(listingId: string): Promise<PublicReviewDto[]> {
    const rows = await this.reviewsRepository.find({
      where: { clinicId: listingId, status: "approved" },
      relations: { user: true },
      order: { createdAt: "DESC" }
    });
    return rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      authorName: r.user?.name ?? "Usuário"
    }));
  }

  async getSummary(listingId: string): Promise<ReviewSummaryDto> {
    const clinic = await this.clinicsRepository.findOne({ where: { id: listingId } });
    if (!clinic) {
      throw new NotFoundException("Clínica não encontrada.");
    }

    const raw = await this.reviewsRepository
      .createQueryBuilder("r")
      .select("SUM(r.rating)", "sum")
      .addSelect("COUNT(*)", "count")
      .where("r.clinicId = :listingId AND r.status = :status", {
        listingId,
        status: "approved"
      })
      .getRawOne<{ sum: string | null; count: string | null }>();

    const appReviewCount = Number(raw?.count ?? 0);
    const sumRatings = raw?.sum != null ? Number(raw.sum) : 0;

    const { averageRating, reviewCount } = computeAppRating({
      appSumRatings: sumRatings,
      appReviewCount
    });

    return {
      averageRating,
      reviewCount
    };
  }
}
