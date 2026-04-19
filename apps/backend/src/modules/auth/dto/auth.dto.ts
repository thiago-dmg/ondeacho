import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Role } from "../../../common/enums/role.enum";

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: Object.values(Role), required: false, default: Role.RESPONSAVEL })
  @IsOptional()
  @IsIn(Object.values(Role))
  role?: Role;
}

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsNotEmpty()
  password!: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: "Token recebido por e-mail" })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class CloseAccountDto {
  @ApiProperty({ description: "Confirmação com a senha atual" })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
