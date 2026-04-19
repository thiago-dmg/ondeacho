import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateIf } from "class-validator";
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

  @ApiProperty({ required: false, type: [String], description: "Especialidades do catálogo (UUID)." })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  specialtyIds?: string[];

  @ApiProperty({ required: false, description: "Texto livre quando há opção «outros» em especialidades." })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  specialtyOther?: string;

  @ApiProperty({ required: false, type: [String], description: "Convênios do catálogo (UUID)." })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  insuranceIds?: string[];

  @ApiProperty({ required: false, description: "Texto livre quando há opção «outros» em convênios." })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  insuranceOther?: string;

  @ApiProperty({ required: false, description: "Clínica existente vinculada ao profissional sugerido." })
  @ValidateIf((o) => o.targetType === SuggestionTargetType.PROFESSIONAL)
  @IsOptional()
  @IsUUID("4")
  linkedClinicId?: string;

  @ApiProperty({
    required: false,
    description: "Nome de clínica nova (profissional + «outros») ou texto auxiliar."
  })
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

  @ApiProperty({
    required: false,
    type: [String],
    description: "Legado (ex.: app mobile): nomes de especialidades em texto."
  })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsString({ each: true })
  specialtyNames?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: "Legado: nomes de convênios em texto."
  })
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
