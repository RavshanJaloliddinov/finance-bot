import {
    Entity,
    Column,
    OneToMany,
    Index,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { IncomeEntity } from './income.entity';
import { ExpenseEntity } from './expense.entity';
import { LimitEntity } from './limit.entity';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { ReportEntity } from './report.entity';

@Entity('users')
@Index(['telegram_id'])
export class UserEntity extends BaseEntity {

    @Column({ unique: true })
    telegram_id: string;

    @Column()
    first_name: string;

    @Column({ nullable: true })
    last_name: string;

    @Column({ nullable: true })
    username: string;

    @Column({ default: 'UZS' })
    currency: string;

    @Column({ default: 'uz' })
    language: string;

    @Column({ type: 'boolean', default: true })
    notifications_enabled: boolean;

    @OneToMany(() => ExpenseEntity, (expense) => expense.user)
    expenses: ExpenseEntity[];

    @OneToMany(() => IncomeEntity, (income) => income.user)
    incomes: IncomeEntity[];

    @OneToMany(() => CategoryEntity, (category) => category.user)
    categories: CategoryEntity[];

    @OneToMany(() => LimitEntity, (limit) => limit.user)
    limits: LimitEntity[];

    @OneToMany(() => ReportEntity, (report) => report.user)
    reports: ReportEntity[];
}