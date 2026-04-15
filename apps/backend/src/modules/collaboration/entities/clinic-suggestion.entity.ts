import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
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

  @Column({ type: "varchar", length: 20, nullable: true })
  phone!: string | null;

  @Column({ name: "whatsapp_phone", type: "varchar", length: 20, nullable: true })
  whatsappPhone!: string | null;

  @Column({ name: "specialty_names", type: "text", array: true, default: "{}" })
  specialtyNames!: string[];

  @Column({ name: "insurance_names", type: "text", array: true, default: "{}" })
  insuranceNames!: string[];

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
