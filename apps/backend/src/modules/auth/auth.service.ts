import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { compareSync, hashSync } from "bcryptjs";
import { Repository } from "typeorm";
import { Role } from "../../common/enums/role.enum";
import { UserEntity } from "../users/entities/user.entity";
import { LoginDto, RegisterDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.toLowerCase();
    const existing = await this.usersRepository.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      throw new BadRequestException("E-mail já cadastrado.");
    }

    const user = this.usersRepository.create({
      name: dto.name,
      email: normalizedEmail,
      passwordHash: hashSync(dto.password, 10),
      role: dto.role
    });
    const saved = await this.usersRepository.save(user);
    return this.issueToken(saved);
  }

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email.toLowerCase();
    const user = await this.usersRepository.findOne({ where: { email: normalizedEmail } });
    if (!user || !compareSync(dto.password, user.passwordHash)) {
      throw new UnauthorizedException("Credenciais inválidas");
    }
    return this.issueToken(user);
  }

  private issueToken(user: UserEntity) {
    const payload = { sub: user.id, email: user.email, role: user.role as Role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }
}
