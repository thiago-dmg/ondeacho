import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
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
