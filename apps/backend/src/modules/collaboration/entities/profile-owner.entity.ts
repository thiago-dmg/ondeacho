import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("profile_owners")
export class ProfileOwnerEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "clinic_id", type: "uuid", nullable: true })
  clinicId!: string | null;

  @Column({ name: "professional_id", type: "uuid", nullable: true })
  professionalId!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
