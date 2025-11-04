import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from 'src/common/database/BaseEntity';

@Entity('incomes')
export class IncomeEntity extends BaseEntity {

    @Column()
    source: string;

    @Column({
        type: 'decimal',
        precision: 15,
        scale: 2,
        nullable: false, // ✅ NULL ga yo'l qo'ymaslik
        default: 0 // ✅ Default qiymat
    })
    amount: string;

    @Column({ nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: ['salary', 'freelance', 'business', 'investment', 'gift', 'other'],
        default: 'other'
    })
    type: string;

    @ManyToOne(() => UserEntity, (user) => user.incomes)
    @JoinColumn({ name: 'userId' }) // ✅ JoinColumn qo'shish
    user: UserEntity;

    @Column({ type: 'boolean', default: false })
    is_recurring: boolean;

    @Column({ nullable: true })
    recurring_period: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;
}