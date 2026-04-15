import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ContactEntity } from "../../contacts/entities/contact.entity";
import { FavoriteEntity } from "../../favorites/entities/favorite.entity";
import { ClinicEntity } from "../../listings/entities/clinic.entity";
import { ProfessionalEntity } from "../../professionals/entities/professional.entity";
import { ReviewEntity } from "../../reviews/entities/review.entity";
import { UserEntity } from "../../users/entities/user.entity";

@Injectable()
export class AdminMetricsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ClinicEntity)
    private readonly clinicsRepository: Repository<ClinicEntity>,
    @InjectRepository(ProfessionalEntity)
    private readonly professionalsRepository: Repository<ProfessionalEntity>,
    @InjectRepository(ReviewEntity)
    private readonly reviewsRepository: Repository<ReviewEntity>,
    @InjectRepository(FavoriteEntity)
    private readonly favoritesRepository: Repository<FavoriteEntity>,
    @InjectRepository(ContactEntity)
    private readonly contactsRepository: Repository<ContactEntity>
  ) {}

  async overview() {
    const [users, clinics, professionals, reviews, pendingReviews, favorites, contacts] =
      await Promise.all([
        this.usersRepository.count(),
        this.clinicsRepository.count(),
        this.professionalsRepository.count(),
        this.reviewsRepository.count(),
        this.reviewsRepository.count({ where: { status: "pending" } }),
        this.favoritesRepository.count(),
        this.contactsRepository.count()
      ]);

    return {
      users,
      clinics,
      professionals,
      reviews,
      pendingReviews,
      favorites,
      contacts
    };
  }
}
