import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListingsFilterDto } from "./dto/listings-filter.dto";
import { ClinicEntity } from "./entities/clinic.entity";
import { ProfessionalEntity } from "../professionals/entities/professional.entity";
import { ReviewEntity } from "../reviews/entities/review.entity";
import { computeAppRating } from "../reviews/review-summary.util";

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
      qb.andWhere("clinic.rating >= :minRating", { minRating: filters.minRating });
    }
    if (filters.specialtyId) {
      qb.andWhere("specialty.id = :specialtyId", { specialtyId: filters.specialtyId });
    }
    if (filters.insuranceId) {
      qb.andWhere("insurance.id = :insuranceId", { insuranceId: filters.insuranceId });
    }

    const clinics = await qb.orderBy("clinic.rating", "DESC").getMany();
    return this.attachDisplayRatings(clinics);
  }

  private async attachDisplayRatings(clinics: ClinicEntity[]) {
    if (clinics.length === 0) {
      return [];
    }

    const ids = clinics.map((c) => c.id);
    const rawRows = await this.reviewsRepository
      .createQueryBuilder("r")
      .select("r.clinicId", "clinicId")
      .addSelect("SUM(r.rating)", "sumRatings")
      .addSelect("COUNT(*)", "appCount")
      .where("r.clinicId IN (:...ids)", { ids })
      .andWhere("r.status = :st", { st: "approved" })
      .groupBy("r.clinicId")
      .getRawMany<{ clinicId: string; sumRatings: string | null; appCount: string | null }>();

    const byClinic = new Map<string, { sumRatings: number; appCount: number }>();
    for (const row of rawRows) {
      byClinic.set(row.clinicId, {
        sumRatings: row.sumRatings != null ? Number(row.sumRatings) : 0,
        appCount: row.appCount != null ? Number(row.appCount) : 0
      });
    }

    const enriched = clinics.map((clinic) => {
      const agg = byClinic.get(clinic.id);
      const appSumRatings = agg?.sumRatings ?? 0;
      const appReviewCount = agg?.appCount ?? 0;

      const { averageRating, reviewCount } = computeAppRating({
        appSumRatings,
        appReviewCount
      });

      return {
        ...clinic,
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
