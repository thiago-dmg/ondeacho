import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity("specialties")
@Unique(["slug"])
export class SpecialtyEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 60 })
  slug!: string;

  @Column({ length: 120 })
  name!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
