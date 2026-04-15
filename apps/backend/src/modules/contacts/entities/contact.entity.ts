import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ClinicEntity } from "../../listings/entities/clinic.entity";
import { UserEntity } from "../../users/entities/user.entity";

@Entity("contacts")
export class ContactEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "clinic_id", type: "uuid" })
  clinicId!: string;

  @Column({ type: "text", nullable: true })
  message!: string | null;

  @Column({ name: "preferred_channel", type: "varchar", length: 20, default: "whatsapp" })
  preferredChannel!: "phone" | "whatsapp" | "email";

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @ManyToOne(() => ClinicEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "clinic_id" })
  clinic!: ClinicEntity;
}
