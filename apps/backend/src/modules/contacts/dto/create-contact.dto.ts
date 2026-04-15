import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateContactDto {
  @ApiProperty()
  @IsUUID("4")
  clinicId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @ApiProperty({ enum: ["phone", "whatsapp", "email"], default: "whatsapp" })
  @IsString()
  @IsNotEmpty()
  @IsIn(["phone", "whatsapp", "email"])
  preferredChannel!: "phone" | "whatsapp" | "email";
}
