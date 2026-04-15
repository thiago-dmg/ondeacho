import { Transform } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class ListingsFilterDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  specialtyId?: string;

  @IsOptional()
  @IsString()
  insuranceId?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === "true" || value === true
  )
  @IsBoolean()
  online?: boolean;
}
