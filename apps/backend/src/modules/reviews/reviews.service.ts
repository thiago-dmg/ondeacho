import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ClinicEntity } from "../listings/entities/clinic.entity";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewEntity } from "./entities/review.entity";

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

  findByListing(listingId: string) {
    return this.reviewsRepository.find({
      where: { clinicId: listingId, status: "approved" },
      order: { createdAt: "DESC" }
    });
  }
}
