import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { InsuranceEntity } from "../../catalog/entities/insurance.entity";
import { SpecialtyEntity } from "../../catalog/entities/specialty.entity";

@Entity("clinics")
export class ClinicEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 160 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ length: 120 })
  city!: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  neighborhood!: string | null;

  @Column({ name: "accepts_online", type: "boolean", default: false })
  acceptsOnline!: boolean;

  @Column({ name: "supports_tea_tdh", type: "boolean", default: true })
  supportsTeaTdh!: boolean;

  @Column({ type: "numeric", precision: 2, scale: 1, default: 0 })
  rating!: number;

  @ManyToMany(() => SpecialtyEntity)
  @JoinTable({
    name: "clinic_specialties",
    joinColumn: { name: "clinic_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "specialty_id", referencedColumnName: "id" }
  })
  specialties!: SpecialtyEntity[];

  @ManyToMany(() => InsuranceEntity)
  @JoinTable({
    name: "clinic_insurances",
    joinColumn: { name: "clinic_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "insurance_id", referencedColumnName: "id" }
  })
  insurances!: InsuranceEntity[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
