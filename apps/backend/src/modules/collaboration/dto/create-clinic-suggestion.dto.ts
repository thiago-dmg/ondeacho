import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { ProfessionalSuggestionAttendance } from "../enums/professional-suggestion-attendance.enum";
import { SuggestionTargetType } from "../enums/suggestion-target-type.enum";

export class CreateClinicSuggestionDto {
  @ApiProperty({ enum: Object.values(SuggestionTargetType) })
  @IsIn(Object.values(SuggestionTargetType))
  targetType!: SuggestionTargetType;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  neighborhood?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine?: string;

  @ApiProperty({
    required: false,
    enum: ProfessionalSuggestionAttendance,
    description: "Obrigatório para profissional no cliente actual; se omitido, assume other_location."
  })
  @ValidateIf((o) => o.targetType === SuggestionTargetType.PROFESSIONAL)
  @IsOptional()
  @IsIn(Object.values(ProfessionalSuggestionAttendance))
  professionalAttendance?: ProfessionalSuggestionAttendance;

  @ApiProperty({ required: false, description: "Nome da clínica onde atende (profissional em clínica de terceiros)." })
  @ValidateIf((o) => o.targetType === SuggestionTargetType.PROFESSIONAL)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  linkedClinicName?: string;

  @ApiProperty({ required: false, description: "CRM ou registro profissional, se aplicável." })
  @ValidateIf((o) => o.targetType === SuggestionTargetType.PROFESSIONAL)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  professionalCrm?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsappPhone?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsString({ each: true })
  specialtyNames?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsString({ each: true })
  insuranceNames?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string;
}
