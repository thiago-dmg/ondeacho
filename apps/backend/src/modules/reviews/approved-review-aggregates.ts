import { Repository } from "typeorm";
import { ReviewEntity } from "./entities/review.entity";

/** Soma e contagem de avaliações aprovadas por clínica (para média só no app). */
export async function aggregateApprovedReviewsByClinicIds(
  reviewsRepository: Repository<ReviewEntity>,
  clinicIds: string[]
): Promise<Map<string, { sumRatings: number; count: number }>> {
  if (clinicIds.length === 0) {
    return new Map();
  }
  const rawRows = await reviewsRepository
    .createQueryBuilder("r")
    .select("r.clinicId", "clinicId")
    .addSelect("SUM(r.rating)", "sumRatings")
    .addSelect("COUNT(*)", "appCount")
    .where("r.clinicId IN (:...ids)", { ids: clinicIds })
    .andWhere("r.status = :st", { st: "approved" })
    .groupBy("r.clinicId")
    .getRawMany<{ clinicId: string; sumRatings: string | null; appCount: string | null }>();

  const map = new Map<string, { sumRatings: number; count: number }>();
  for (const row of rawRows) {
    map.set(row.clinicId, {
      sumRatings: row.sumRatings != null ? Number(row.sumRatings) : 0,
      count: row.appCount != null ? Number(row.appCount) : 0
    });
  }
  return map;
}
