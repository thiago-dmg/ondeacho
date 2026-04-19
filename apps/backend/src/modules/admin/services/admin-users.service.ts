import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { hashSync } from "bcryptjs";
import { Repository } from "typeorm";
import { Role } from "../../../common/enums/role.enum";
import { UserEntity } from "../../users/entities/user.entity";
import { AdminUpdateUserDto } from "../dto/admin-user.dto";

export type PaginatedUsers = {
  items: { id: string; name: string; email: string; role: Role; createdAt: Date }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {}

  async list(pageRaw: number, limitRaw: number, q?: string): Promise<PaginatedUsers> {
    const page = Math.max(1, pageRaw || 1);
    const limit = Math.min(100, Math.max(1, limitRaw || 20));
    const qb = this.usersRepository.createQueryBuilder("u").orderBy("u.createdAt", "DESC");
    const term = q?.trim().toLowerCase();
    if (term) {
      qb.andWhere("(LOWER(u.name) LIKE :t OR LOWER(u.email) LIKE :t)", { t: `%${term}%` });
    }
    const total = await qb.clone().getCount();
    const users = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    const items = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as Role,
      createdAt: u.createdAt
    }));
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit))
    };
  }

  async update(actorId: string, id: string, dto: AdminUpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }
    if (dto.email !== undefined) {
      const normalized = dto.email.toLowerCase().trim();
      const taken = await this.usersRepository.findOne({ where: { email: normalized } });
      if (taken && taken.id !== id) {
        throw new ConflictException("E-mail já em uso.");
      }
      user.email = normalized;
    }
    if (dto.name !== undefined) {
      user.name = dto.name.trim();
    }
    if (dto.password !== undefined) {
      user.passwordHash = hashSync(dto.password, 10);
      user.passwordResetTokenHash = null;
      user.passwordResetExpiresAt = null;
    }
    if (dto.role !== undefined) {
      if (user.role === Role.ADMIN && dto.role !== Role.ADMIN) {
        const adminCount = await this.usersRepository.count({ where: { role: Role.ADMIN } });
        if (adminCount <= 1) {
          throw new BadRequestException("Não é possível remover o papel admin do único administrador.");
        }
      }
      user.role = dto.role;
    }
    await this.usersRepository.save(user);
    return this.toPublic(user);
  }

  async remove(actorId: string, id: string) {
    if (actorId === id) {
      throw new ForbiddenException("Não é possível excluir o seu próprio usuário por aqui. Use “Encerrar conta” no perfil.");
    }
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }
    if (user.role === Role.ADMIN) {
      const adminCount = await this.usersRepository.count({ where: { role: Role.ADMIN } });
      if (adminCount <= 1) {
        throw new BadRequestException("Não é possível excluir o único administrador.");
      }
    }
    await this.usersRepository.remove(user);
    return { ok: true };
  }

  private toPublic(user: UserEntity) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  }
}
