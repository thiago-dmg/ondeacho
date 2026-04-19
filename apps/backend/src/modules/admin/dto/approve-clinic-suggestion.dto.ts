import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

/**
 * Corpo do PATCH ao aprovar sugestão.
 * Para `targetType: profissional`, é obrigatório um dos caminhos:
 * - `professionalClinicId`: vincular a uma clínica já existente, ou
 * - `createNewClinicFromDraft: true`: criar clínica nova a partir do rascunho (nome/cidade na sugestão ou em `draft*`).
 */
export class ApproveClinicSuggestionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({
    required: false,
    description: "UUID de clínica existente para vincular o profissional (prioridade sobre o vínculo da sugestão)."
  })
  @IsOptional()
  @IsUUID("4")
  professionalClinicId?: string;

  @ApiProperty({
    required: false,
    description: "Se true, cria uma clínica nova com dados do rascunho antes de criar o profissional."
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  createNewClinicFromDraft?: boolean;

  @ApiProperty({ required: false, description: "Nome da nova clínica (se não usar o da sugestão)." })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  draftClinicName?: string;

  @ApiProperty({ required: false, description: "Cidade da nova clínica (se não usar o da sugestão)." })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  draftClinicCity?: string;
}
