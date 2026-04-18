import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from "class-validator";

export class CreateReviewDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  clinicId!: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  comment!: string;
}
