import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { aggregateApprovedReviewsByClinicIds } from "../reviews/approved-review-aggregates";
import { computeAppRating } from "../reviews/review-summary.util";
import { ListingsFilterDto } from "./dto/listings-filter.dto";
import { ClinicEntity } from "./entities/clinic.entity";
import { ProfessionalEntity } from "../professionals/entities/professional.entity";
import { ReviewEntity } from "../reviews/entities/review.entity";

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(ClinicEntity)
    private readonly clinicsRepository: Repository<ClinicEntity>,
    @InjectRepository(ProfessionalEntity)
    private readonly professionalsRepository: Repository<ProfessionalEntity>,
    @InjectRepository(ReviewEntity)
    private readonly reviewsRepository: Repository<ReviewEntity>
  ) {}

  async findAll(filters: ListingsFilterDto) {
    const qb = this.clinicsRepository
      .createQueryBuilder("clinic")
      .leftJoinAndSelect("clinic.specialties", "specialty")
      .leftJoinAndSelect("clinic.insurances", "insurance");

    if (filters.city) {
      qb.andWhere("LOWER(clinic.city) = LOWER(:city)", { city: filters.city });
    }
    if (filters.online !== undefined) {
      qb.andWhere("clinic.acceptsOnline = :online", { online: filters.online });
    }
    if (filters.minRating !== undefined) {
      qb.andWhere(
        `clinic.id IN (
          SELECT r.clinic_id FROM reviews r
          WHERE r.status = :approvedStatus
          GROUP BY r.clinic_id
          HAVING AVG(r.rating) >= :minRating
        )`,
        { approvedStatus: "approved", minRating: filters.minRating }
      );
    }
    if (filters.specialtyId) {
      qb.andWhere("specialty.id = :specialtyId", { specialtyId: filters.specialtyId });
    }
    if (filters.insuranceId) {
      qb.andWhere("insurance.id = :insuranceId", { insuranceId: filters.insuranceId });
    }

    const clinics = await qb.orderBy("clinic.id", "ASC").getMany();
    return this.attachDisplayRatings(clinics);
  }

  private async attachDisplayRatings(clinics: ClinicEntity[]) {
    if (clinics.length === 0) {
      return [];
    }

    const ids = clinics.map((c) => c.id);
    const byClinic = await aggregateApprovedReviewsByClinicIds(this.reviewsRepository, ids);

    const enriched = clinics.map((clinic) => {
      const agg = byClinic.get(clinic.id);
      const appSumRatings = agg?.sumRatings ?? 0;
      const appReviewCount = agg?.count ?? 0;

      const { averageRating, reviewCount } = computeAppRating({
        appSumRatings,
        appReviewCount
      });

      return {
        ...clinic,
        rating: averageRating ?? 0,
        displayRating: averageRating,
        displayReviewCount: reviewCount
      };
    });

    enriched.sort((a, b) => {
      const ra = a.displayRating ?? -1;
      const rb = b.displayRating ?? -1;
      return rb - ra;
    });

    return enriched;
  }

  async findOne(id: string) {
    const clinic = await this.clinicsRepository.findOne({
      where: { id },
      relations: { specialties: true, insurances: true }
    });
    if (!clinic) {
      throw new NotFoundException("Clínica não encontrada.");
    }

    const professionals = await this.professionalsRepository.find({
      where: { clinicId: id },
      order: { name: "ASC" },
      relations: { specialties: true, insurances: true }
    });

    const [enriched] = await this.attachDisplayRatings([clinic]);

    return {
      ...enriched,
      professionals
    };
  }
}
