import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { InsuranceEntity } from "../../catalog/entities/insurance.entity";
import { SpecialtyEntity } from "../../catalog/entities/specialty.entity";
import { ClinicEntity } from "../../listings/entities/clinic.entity";

@Entity("professionals")
export class ProfessionalEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 160 })
  name!: string;

  @Column({ name: "clinic_id", type: "uuid", nullable: true })
  clinicId!: string | null;

  @Column({ length: 120 })
  city!: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  neighborhood!: string | null;

  @Column({ name: "phone", type: "varchar", length: 20, nullable: true })
  phone!: string | null;

  @Column({ name: "whatsapp_phone", type: "varchar", length: 20, nullable: true })
  whatsappPhone!: string | null;

  @Column({ name: "added_by_community", type: "boolean", default: false })
  addedByCommunity!: boolean;

  @Column({ name: "is_claimed", type: "boolean", default: false })
  isClaimed!: boolean;

  @Column({ name: "is_verified", type: "boolean", default: false })
  isVerified!: boolean;

  @Column({ name: "accepts_online", type: "boolean", default: false })
  acceptsOnline!: boolean;

  @Column({ name: "supports_tea_tdh", type: "boolean", default: true })
  supportsTeaTdh!: boolean;

  @Column({ type: "numeric", precision: 2, scale: 1, default: 0 })
  rating!: number;

  @ManyToOne(() => ClinicEntity, { onDelete: "SET NULL" })
  @JoinColumn({ name: "clinic_id" })
  clinic!: ClinicEntity | null;

  @ManyToMany(() => SpecialtyEntity)
  @JoinTable({
    name: "professional_specialties",
    joinColumn: { name: "professional_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "specialty_id", referencedColumnName: "id" }
  })
  specialties!: SpecialtyEntity[];

  @ManyToMany(() => InsuranceEntity)
  @JoinTable({
    name: "professional_insurances",
    joinColumn: { name: "professional_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "insurance_id", referencedColumnName: "id" }
  })
  insurances!: InsuranceEntity[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
