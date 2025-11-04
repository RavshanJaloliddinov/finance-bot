import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from 'src/common/database/BaseEntity';
import { CategoryEntity } from './category.entity';

@Entity('expenses')
export class ExpenseEntity extends BaseEntity {

  @Column()
  title: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  payment_method: string; // Naqd, Karta, Online

  @Column({ nullable: true })
  location: string;

  @ManyToOne(() => CategoryEntity, (category) => category.expenses)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @Column({ type: 'boolean', default: false })
  is_recurring: boolean; // Davriy xarajat

  @Column({ nullable: true })
  recurring_period: string; // daily, weekly, monthly

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // Qo'shimcha ma'lumotlar

  @ManyToOne(() => UserEntity, (user) => user.expenses)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;


}
