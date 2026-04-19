import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReviewEntity } from "../../reviews/entities/review.entity";

const PAGE_SIZES = [10, 25, 50, 100] as const;

function normalizeLimit(raw: number): number {
  if (PAGE_SIZES.includes(raw as (typeof PAGE_SIZES)[number])) {
    return raw;
  }
  return 25;
}

export type AdminReviewRow = {
  id: string;
  clinicId: string;
  clinicName: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
};

@Injectable()
export class AdminReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewsRepository: Repository<ReviewEntity>
  ) {}

  async list(pageRaw = 1, limitRaw = 25, q?: string, status?: string) {
    const page = Math.max(1, pageRaw || 1);
    const limit = normalizeLimit(Number(limitRaw) || 25);
    const qb = this.reviewsRepository
      .createQueryBuilder("r")
      .leftJoinAndSelect("r.clinic", "clinic")
      .orderBy("r.createdAt", "DESC");
    const term = q?.trim().toLowerCase();
    if (term) {
      qb.andWhere("(LOWER(clinic.name) LIKE :t OR LOWER(r.comment) LIKE :t)", { t: `%${term}%` });
    }
    if (status && status !== "all") {
      qb.andWhere("r.status = :st", { st: status });
    }
    const total = await qb.clone().getCount();
    const rows = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    const items: AdminReviewRow[] = rows.map((r) => ({
      id: r.id,
      clinicId: r.clinicId,
      clinicName: r.clinic?.name ?? "—",
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt
    }));
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit))
    };
  }

  async moderate(id: string, status: "approved" | "rejected") {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException("Avaliação não encontrada.");
    review.status = status;
    return this.reviewsRepository.save(review);
  }

  async remove(id: string) {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException("Avaliação não encontrada.");
    await this.reviewsRepository.remove(review);
  }
}
