import { UserEntity } from "src/entities";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne } from "typeorm";

@Entity()
export class BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
    })
    is_active: boolean;

    @Column({
        name: 'is_deleted',
        type: 'boolean',
        default: false,
    })
    is_deleted: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    deleted_at: Date;

    @ManyToOne(() => UserEntity, { nullable: true })
    created_by?: UserEntity;

    @ManyToOne(() => UserEntity, { nullable: true })
    updated_by?: UserEntity;

    @ManyToOne(() => UserEntity, { nullable: true })
    deleted_by?: UserEntity;
}