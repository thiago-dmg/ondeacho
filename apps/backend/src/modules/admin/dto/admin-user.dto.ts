import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Role } from "../../../common/enums/role.enum";

const ROLES = Object.values(Role);

export class AdminUpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, description: "Nova senha (mín. 8 caracteres)" })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({ enum: ROLES, required: false })
  @IsOptional()
  @IsIn(ROLES)
  role?: Role;
}
