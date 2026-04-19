import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class SupportMessageDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  message!: string;
}
