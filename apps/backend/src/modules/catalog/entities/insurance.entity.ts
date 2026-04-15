import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity("insurances")
@Unique(["slug"])
export class InsuranceEntity {
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
