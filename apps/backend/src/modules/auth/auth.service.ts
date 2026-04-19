import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { compareSync, hashSync } from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { Repository } from "typeorm";
import { Role } from "../../common/enums/role.enum";
import { MailService } from "../mail/mail.service";
import { UserEntity } from "../users/entities/user.entity";
import {
  ChangePasswordDto,
  CloseAccountDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  UpdateProfileDto
} from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
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
      role: dto.role ?? Role.RESPONSAVEL
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

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }
    if (dto.name !== undefined) {
      user.name = dto.name.trim();
    }
    await this.usersRepository.save(user);
    return this.getProfile(userId);
  }

  /** Resposta uniforme para não revelar se o e-mail existe. */
  async requestPasswordReset(dto: ForgotPasswordDto): Promise<{ ok: true }> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.usersRepository.findOne({ where: { email: normalizedEmail } });
    if (user) {
      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      user.passwordResetTokenHash = tokenHash;
      user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await this.usersRepository.save(user);
      const base = (this.config.get<string>("PASSWORD_RESET_PUBLIC_URL") ?? "http://localhost:3002")
        .trim()
        .replace(/\/+$/, "");
      const resetUrl = `${base}/redefinir-senha?token=${encodeURIComponent(token)}`;
      await this.mailService.sendPasswordResetEmail(normalizedEmail, resetUrl);
    }
    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ ok: true }> {
    const tokenHash = createHash("sha256").update(dto.token.trim()).digest("hex");
    const user = await this.usersRepository.findOne({
      where: { passwordResetTokenHash: tokenHash }
    });
    const now = new Date();
    if (!user?.passwordResetExpiresAt || user.passwordResetExpiresAt < now) {
      throw new BadRequestException("Link inválido ou expirado. Solicite um novo e-mail.");
    }
    user.passwordHash = hashSync(dto.password, 10);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await this.usersRepository.save(user);
    return { ok: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ ok: true }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }
    if (!compareSync(dto.currentPassword, user.passwordHash)) {
      throw new UnauthorizedException("Senha atual incorreta.");
    }
    user.passwordHash = hashSync(dto.newPassword, 10);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await this.usersRepository.save(user);
    return { ok: true };
  }

  async closeAccount(userId: string, dto: CloseAccountDto): Promise<{ ok: true }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }
    if (!compareSync(dto.password, user.passwordHash)) {
      throw new UnauthorizedException("Senha incorreta.");
    }
    if (user.role === Role.ADMIN) {
      const adminCount = await this.usersRepository.count({ where: { role: Role.ADMIN } });
      if (adminCount <= 1) {
        throw new BadRequestException("Não é possível excluir o único administrador do sistema.");
      }
    }
    await this.usersRepository.remove(user);
    return { ok: true };
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
