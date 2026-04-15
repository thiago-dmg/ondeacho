import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from "typeorm";
import { ClinicEntity } from "../../listings/entities/clinic.entity";
import { UserEntity } from "../../users/entities/user.entity";

@Entity("reviews")
@Unique(["clinicId", "userId"])
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class ReviewEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "clinic_id", type: "uuid" })
  clinicId!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ type: "int" })
  rating!: number;

  @Column({ type: "text" })
  comment!: string;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: "pending" | "approved" | "rejected";

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne(() => ClinicEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "clinic_id" })
  clinic!: ClinicEntity;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;
}
