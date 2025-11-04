import {
    Entity,
    Column,
    OneToMany,
    ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ExpenseEntity } from './expense.entity';
import { LimitEntity } from './limit.entity';
import { BaseEntity } from 'src/common/database/BaseEntity';



@Entity('categories')
export class CategoryEntity extends BaseEntity {
    @Column()
    name: string;

    @Column({ nullable: true })
    icon: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    color: string;

    @Column({ type: 'int', default: 0 })
    order: number;

    @ManyToOne(() => UserEntity, (user) => user.categories)
    user: UserEntity;

    @OneToMany(() => ExpenseEntity, (expense) => expense.category)
    expenses: ExpenseEntity[];

    @OneToMany(() => LimitEntity, (limit) => limit.category)
    limits: LimitEntity[];

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @Column({ type: 'boolean', default: false })
    is_default: boolean;

}