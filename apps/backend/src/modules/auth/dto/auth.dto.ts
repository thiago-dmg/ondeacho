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
