import {
    Entity,
    Column,
    ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from 'src/common/database/BaseEntity';


@Entity('budgets')
export class BudgetEntity extends BaseEntity {

    @ManyToOne(() => UserEntity)
    user: UserEntity;

    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    target_amount: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    current_amount: number;

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    @Column({
        type: 'enum',
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    })
    status: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

}