import {
    Entity,
    Column,
    ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CategoryEntity } from './category.entity';
import { BaseEntity } from 'src/common/database/BaseEntity';

@Entity('limits')
export class LimitEntity extends BaseEntity {
    @Column({ type: 'decimal', precision: 15, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly',
    })
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';

    @ManyToOne(() => UserEntity, (user) => user.limits)
    user: UserEntity;

    @ManyToOne(() => CategoryEntity, (category) => category.limits, { nullable: true })
    category: CategoryEntity | null;

    @Column({ type: 'boolean', default: true })
    notify_on_warning: boolean; // 80% dan oshganda xabar berish

    @Column({ type: 'boolean', default: true })
    notify_on_exceed: boolean; // Limitdan oshganda xabar berish

}