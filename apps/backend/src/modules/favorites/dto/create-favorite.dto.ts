import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateFavoriteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsUUID("4")
  clinicId!: string;
}
