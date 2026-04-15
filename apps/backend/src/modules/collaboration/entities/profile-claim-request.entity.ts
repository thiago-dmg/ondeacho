import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ReviewStatus } from "../enums/review-status.enum";

@Entity("profile_claim_requests")
export class ProfileClaimRequestEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "requester_user_id", type: "uuid" })
  requesterUserId!: string;

  @Column({ name: "clinic_id", type: "uuid", nullable: true })
  clinicId!: string | null;

  @Column({ name: "professional_id", type: "uuid", nullable: true })
  professionalId!: string | null;

  @Column({ name: "requester_name", type: "varchar", length: 120 })
  requesterName!: string;

  @Column({ name: "requester_email", type: "varchar", length: 160 })
  requesterEmail!: string;

  @Column({ name: "requester_phone", type: "varchar", length: 20 })
  requesterPhone!: string;

  @Column({ type: "text", nullable: true })
  message!: string | null;

  @Column({ type: "varchar", length: 20, default: ReviewStatus.PENDING })
  status!: ReviewStatus;

  @Column({ name: "reviewed_by_user_id", type: "uuid", nullable: true })
  reviewedByUserId!: string | null;

  @Column({ name: "reviewed_at", type: "timestamp", nullable: true })
  reviewedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
