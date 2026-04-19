import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository, SelectQueryBuilder } from "typeorm";
import { InsuranceEntity } from "../../catalog/entities/insurance.entity";
import { SpecialtyEntity } from "../../catalog/entities/specialty.entity";
import { ProfessionalEntity } from "../../professionals/entities/professional.entity";
import { UpsertProfessionalDto } from "../dto/upsert-professional.dto";

const PAGE_SIZES = [10, 25, 50, 100] as const;

function normalizeLimit(raw: number): number {
  if (PAGE_SIZES.includes(raw as (typeof PAGE_SIZES)[number])) {
    return raw;
  }
  return 25;
}

function parseOptionalFloat(v?: string): number | undefined {
  if (v === undefined || v === null || String(v).trim() === "") {
    return undefined;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

@Injectable()
export class AdminProfessionalsService {
  constructor(
    @InjectRepository(ProfessionalEntity)
    private readonly professionalsRepository: Repository<ProfessionalEntity>,
    @InjectRepository(SpecialtyEntity)
    private readonly specialtiesRepository: Repository<SpecialtyEntity>,
    @InjectRepository(InsuranceEntity)
    private readonly insurancesRepository: Repository<InsuranceEntity>
  ) {}

  /** `clinicAlias` = alias já ligado com `p.clinic` (ex.: `clinic`). */
  private addProfListPredicates(
    qb: SelectQueryBuilder<ProfessionalEntity>,
    clinicAlias: string,
    q?: string,
    minRating?: number,
    maxRating?: number
  ) {
    const term = q?.trim().toLowerCase();
    if (term) {
      qb.andWhere(
        `(LOWER(p.name) LIKE :t OR LOWER(p.city) LIKE :t OR LOWER(COALESCE(p.neighborhood, '')) LIKE :t OR LOWER(COALESCE(${clinicAlias}.name, '')) LIKE :t)`,
        { t: `%${term}%` }
      );
    }
    if (minRating !== undefined) {
      qb.andWhere("p.rating >= :minR", { minR: minRating });
    }
    if (maxRating !== undefined) {
      qb.andWhere("p.rating <= :maxR", { maxR: maxRating });
    }
  }

  async list(
    pageRaw = 1,
    limitRaw = 25,
    q?: string,
    minRatingRaw?: string,
    maxRatingRaw?: string
  ) {
    const page = Math.max(1, pageRaw || 1);
    const limit = normalizeLimit(Number(limitRaw) || 25);
    const minRating = parseOptionalFloat(minRatingRaw);
    const maxRating = parseOptionalFloat(maxRatingRaw);

    const countQb = this.professionalsRepository
      .createQueryBuilder("p")
      .leftJoin("p.clinic", "clinic")
      .orderBy("p.createdAt", "DESC");
    this.addProfListPredicates(countQb, "clinic", q, minRating, maxRating);
    const total = await countQb.getCount();

    const dataQb = this.professionalsRepository
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.specialties", "s")
      .leftJoinAndSelect("p.insurances", "i")
      .leftJoinAndSelect("p.clinic", "clinic")
      .orderBy("p.createdAt", "DESC");
    this.addProfListPredicates(dataQb, "clinic", q, minRating, maxRating);
    const items = await dataQb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit))
    };
  }

  async create(dto: UpsertProfessionalDto) {
    const specialties = dto.specialtyIds?.length
      ? await this.specialtiesRepository.findBy({ id: In(dto.specialtyIds) })
      : [];
    const insurances = dto.insuranceIds?.length
      ? await this.insurancesRepository.findBy({ id: In(dto.insuranceIds) })
      : [];

    const entity = this.professionalsRepository.create({
      name: dto.name,
      crm: dto.crm?.trim() || null,
      clinicId: dto.clinicId ?? null,
      city: dto.city,
      neighborhood: dto.neighborhood ?? null,
      acceptsOnline: dto.acceptsOnline ?? false,
      supportsTeaTdh: dto.supportsTeaTdh ?? true,
      rating: dto.rating ?? 0,
      specialties,
      insurances
    });
    return this.professionalsRepository.save(entity);
  }

  async update(id: string, dto: UpsertProfessionalDto) {
    const entity = await this.professionalsRepository.findOne({
      where: { id },
      relations: { specialties: true, insurances: true }
    });
    if (!entity) throw new NotFoundException("Profissional não encontrado.");
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.crm !== undefined) entity.crm = dto.crm.trim() || null;
    if (dto.city !== undefined) entity.city = dto.city;
    if (dto.clinicId !== undefined) entity.clinicId = dto.clinicId ?? null;
    if (dto.neighborhood !== undefined) entity.neighborhood = dto.neighborhood ?? entity.neighborhood;
    if (dto.acceptsOnline !== undefined) entity.acceptsOnline = dto.acceptsOnline;
    if (dto.supportsTeaTdh !== undefined) entity.supportsTeaTdh = dto.supportsTeaTdh;
    if (dto.rating !== undefined) entity.rating = dto.rating;
    if (dto.specialtyIds) {
      entity.specialties = await this.specialtiesRepository.findBy({ id: In(dto.specialtyIds) });
    }
    if (dto.insuranceIds) {
      entity.insurances = await this.insurancesRepository.findBy({ id: In(dto.insuranceIds) });
    }
    return this.professionalsRepository.save(entity);
  }

  async remove(id: string) {
    const entity = await this.professionalsRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException("Profissional não encontrado.");
    await this.professionalsRepository.delete(id);
    return { success: true };
  }
}
