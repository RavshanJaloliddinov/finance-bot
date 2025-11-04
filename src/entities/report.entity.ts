import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { UserEntity } from './user.entity';

@Entity('reports')
export class ReportEntity extends BaseEntity {

    @Column()
    period: string;

    @Column('decimal', { precision: 15, scale: 2 })
    total_income: number;

    @Column('decimal', { precision: 15, scale: 2 })
    total_expense: number;

    @Column('decimal', { precision: 15, scale: 2 })
    balance: number;

    @Column('json')
    expenses_by_category: {
        name: string;
        total: number;
        icon?: string;
    }[];

    // ✅ BU BOG'LASH UCHUN YETARLI
    @ManyToOne(() => UserEntity, (user) => user.reports)
    @JoinColumn({ name: 'userId' })
    user: UserEntity;
}