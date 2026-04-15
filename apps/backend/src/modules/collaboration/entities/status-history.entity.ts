import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("status_history")
export class StatusHistoryEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "entity_type", type: "varchar", length: 40 })
  entityType!: string;

  @Column({ name: "entity_id", type: "uuid" })
  entityId!: string;

  @Column({ name: "from_status", type: "varchar", length: 20 })
  fromStatus!: string;

  @Column({ name: "to_status", type: "varchar", length: 20 })
  toStatus!: string;

  @Column({ name: "acted_by_user_id", type: "uuid", nullable: true })
  actedByUserId!: string | null;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
