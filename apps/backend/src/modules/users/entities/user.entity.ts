import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Role } from "../../../common/enums/role.enum";

@Entity("users")
@Unique(["email"])
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 160 })
  email!: string;

  @Column({ name: "password_hash", length: 255 })
  passwordHash!: string;

  @Column({ name: "password_reset_token_hash", type: "varchar", length: 255, nullable: true })
  passwordResetTokenHash!: string | null;

  @Column({ name: "password_reset_expires_at", type: "timestamptz", nullable: true })
  passwordResetExpiresAt!: Date | null;

  @Column({ type: "varchar", length: 20 })
  role!: Role;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
