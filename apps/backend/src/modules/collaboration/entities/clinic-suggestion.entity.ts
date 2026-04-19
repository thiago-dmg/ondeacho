import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProfessionalSuggestionAttendance } from "../enums/professional-suggestion-attendance.enum";
import { ReviewStatus } from "../enums/review-status.enum";
import { SuggestionTargetType } from "../enums/suggestion-target-type.enum";

@Entity("clinic_suggestions")
export class ClinicSuggestionEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "suggested_by_user_id", type: "uuid" })
  suggestedByUserId!: string;

  @Column({ name: "suggested_by_name", type: "varchar", length: 120 })
  suggestedByName!: string;

  @Column({ name: "target_type", type: "varchar", length: 20 })
  targetType!: SuggestionTargetType;

  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Column({ type: "varchar", length: 120 })
  city!: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  neighborhood!: string | null;

  @Column({ name: "address_line", type: "varchar", length: 200, nullable: true })
  addressLine!: string | null;

  /** Nome da clínica onde o profissional atende (texto livre; sugestão targetType = profissional). */
  @Column({ name: "linked_clinic_name", type: "varchar", length: 200, nullable: true })
  linkedClinicName!: string | null;

  @Column({ name: "professional_crm", type: "varchar", length: 80, nullable: true })
  professionalCrm!: string | null;

  @Column({ name: "professional_attendance", type: "varchar", length: 40, nullable: true })
  professionalAttendance!: ProfessionalSuggestionAttendance | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone!: string | null;

  @Column({ name: "whatsapp_phone", type: "varchar", length: 20, nullable: true })
  whatsappPhone!: string | null;

  @Column({ name: "specialty_names", type: "text", array: true, default: "{}" })
  specialtyNames!: string[];

  @Column({ name: "insurance_names", type: "text", array: true, default: "{}" })
  insuranceNames!: string[];

  @Column({ name: "specialty_ids", type: "uuid", array: true, default: "{}" })
  specialtyIds!: string[];

  @Column({ name: "specialty_other", type: "varchar", length: 500, nullable: true })
  specialtyOther!: string | null;

  @Column({ name: "insurance_ids", type: "uuid", array: true, default: "{}" })
  insuranceIds!: string[];

  @Column({ name: "insurance_other", type: "varchar", length: 500, nullable: true })
  insuranceOther!: string | null;

  @Column({ name: "linked_clinic_id", type: "uuid", nullable: true })
  linkedClinicId!: string | null;

  @Column({ type: "text", nullable: true })
  observations!: string | null;

  @Column({ type: "varchar", length: 20, default: ReviewStatus.PENDING })
  status!: ReviewStatus;

  @Column({ name: "reviewed_by_user_id", type: "uuid", nullable: true })
  reviewedByUserId!: string | null;

  @Column({ name: "reviewed_at", type: "timestamp", nullable: true })
  reviewedAt!: Date | null;

  @Column({ name: "approved_clinic_id", type: "uuid", nullable: true })
  approvedClinicId!: string | null;

  @Column({ name: "approved_professional_id", type: "uuid", nullable: true })
  approvedProfessionalId!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
