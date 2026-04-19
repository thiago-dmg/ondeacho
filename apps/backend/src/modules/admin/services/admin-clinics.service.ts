import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { InsuranceEntity } from "../../catalog/entities/insurance.entity";
import { SpecialtyEntity } from "../../catalog/entities/specialty.entity";
import { ClinicEntity } from "../../listings/entities/clinic.entity";
import { aggregateApprovedReviewsByClinicIds } from "../../reviews/approved-review-aggregates";
import { computeAppRating } from "../../reviews/review-summary.util";
import { ReviewEntity } from "../../reviews/entities/review.entity";
import { UpsertClinicDto } from "../dto/upsert-clinic.dto";

@Injectable()
export class AdminClinicsService {
  constructor(
    @InjectRepository(ClinicEntity)
    private readonly clinicsRepository: Repository<ClinicEntity>,
    @InjectRepository(SpecialtyEntity)
    private readonly specialtiesRepository: Repository<SpecialtyEntity>,
    @InjectRepository(InsuranceEntity)
    private readonly insurancesRepository: Repository<InsuranceEntity>,
    @InjectRepository(ReviewEntity)
    private readonly reviewsRepository: Repository<ReviewEntity>
  ) {}

  async list(pageRaw = 1, limitRaw = 20, q?: string) {
    const page = Math.max(1, pageRaw || 1);
    const limit = Math.min(100, Math.max(1, limitRaw || 20));
    const qb = this.clinicsRepository.createQueryBuilder("c").orderBy("c.createdAt", "DESC");
    const term = q?.trim().toLowerCase();
    if (term) {
      qb.andWhere(
        "(LOWER(c.name) LIKE :t OR LOWER(c.city) LIKE :t OR LOWER(COALESCE(c.neighborhood, '')) LIKE :t)",
        { t: `%${term}%` }
      );
    }
    const total = await qb.clone().getCount();
    const clinics = await qb
      .leftJoinAndSelect("c.specialties", "s")
      .leftJoinAndSelect("c.insurances", "i")
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    if (clinics.length === 0) {
      return {
        items: [] as unknown[],
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit))
      };
    }
    const byClinic = await aggregateApprovedReviewsByClinicIds(
      this.reviewsRepository,
      clinics.map((c) => c.id)
    );
    const items = clinics.map((clinic) => {
      const agg = byClinic.get(clinic.id);
      const { averageRating, reviewCount } = computeAppRating({
        appSumRatings: agg?.sumRatings ?? 0,
        appReviewCount: agg?.count ?? 0
      });
      return {
        ...clinic,
        rating: averageRating ?? 0,
        displayRating: averageRating,
        displayReviewCount: reviewCount
      };
    });
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit))
    };
  }

  async create(dto: UpsertClinicDto) {
    const specialties = dto.specialtyIds?.length
      ? await this.specialtiesRepository.findBy({ id: In(dto.specialtyIds) })
      : [];
    const insurances = dto.insuranceIds?.length
      ? await this.insurancesRepository.findBy({ id: In(dto.insuranceIds) })
      : [];

    const clinic = this.clinicsRepository.create({
      ...dto,
      description: dto.description ?? null,
      neighborhood: dto.neighborhood ?? null,
      addressLine: dto.addressLine ?? null,
      addressNumber: dto.addressNumber ?? null,
      zipcode: dto.zipcode ?? null,
      phone: dto.phone ?? null,
      whatsappPhone: dto.whatsappPhone ?? null,
      rating: 0,
      acceptsOnline: dto.acceptsOnline ?? false,
      supportsTeaTdh: dto.supportsTeaTdh ?? true,
      specialties,
      insurances
    });
    return this.clinicsRepository.save(clinic);
  }

  async update(id: string, dto: UpsertClinicDto) {
    const clinic = await this.clinicsRepository.findOne({
      where: { id },
      relations: { specialties: true, insurances: true }
    });
    if (!clinic) {
      throw new NotFoundException("Clínica não encontrada.");
    }

    Object.assign(clinic, {
      ...dto,
      description: dto.description ?? clinic.description,
      neighborhood: dto.neighborhood ?? clinic.neighborhood,
      addressLine: dto.addressLine ?? clinic.addressLine,
      addressNumber: dto.addressNumber ?? clinic.addressNumber,
      zipcode: dto.zipcode ?? clinic.zipcode,
      phone: dto.phone ?? clinic.phone,
      whatsappPhone: dto.whatsappPhone ?? clinic.whatsappPhone
    });

    if (dto.specialtyIds) {
      clinic.specialties = await this.specialtiesRepository.findBy({ id: In(dto.specialtyIds) });
    }
    if (dto.insuranceIds) {
      clinic.insurances = await this.insurancesRepository.findBy({ id: In(dto.insuranceIds) });
    }
    return this.clinicsRepository.save(clinic);
  }

  async remove(id: string) {
    const clinic = await this.clinicsRepository.findOne({ where: { id } });
    if (!clinic) {
      throw new NotFoundException("Clínica não encontrada.");
    }
    await this.clinicsRepository.delete(id);
    return { success: true };
  }
}
