import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ClinicEntity } from "../../listings/entities/clinic.entity";
import { UserEntity } from "../../users/entities/user.entity";

@Entity("favorites")
@Unique(["userId", "clinicId"])
export class FavoriteEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "clinic_id", type: "uuid" })
  clinicId!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @ManyToOne(() => ClinicEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "clinic_id" })
  clinic!: ClinicEntity;
}
