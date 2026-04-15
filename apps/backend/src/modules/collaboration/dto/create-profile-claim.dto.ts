import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateProfileClaimDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID("4")
  clinicId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID("4")
  professionalId?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  requesterName!: string;

  @ApiProperty()
  @IsEmail()
  requesterEmail!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  requesterPhone!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
