import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CategoryEntity, ExpenseEntity, UserEntity } from 'src/entities';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(ExpenseEntity)
    private readonly expenseRepository: Repository<ExpenseEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) { }

  /**
   * Yangi xarajat qo‘shish
   */
  async createExpense(dto: CreateExpenseDto): Promise<ExpenseEntity> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId, is_deleted: false },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    const category = await this.categoryRepository.findOne({
      where: { id: dto.category_id, is_deleted: false },
    });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');

    const expense = this.expenseRepository.create({
      title: dto.title,
      amount: dto.amount,
      user,
      category,
    });

    return await this.expenseRepository.save(expense);
  }

  /**
   * Foydalanuvchining barcha xarajatlarini olish
   */
  async findAllByUser(userId: string): Promise<ExpenseEntity[]> {
    return await this.expenseRepository.find({
      where: { user: { id: userId }, is_deleted: false },
      relations: ['category'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * ID bo‘yicha xarajatni olish
   */
  async findById(id: string): Promise<ExpenseEntity> {
    const expense = await this.expenseRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['category', 'user'],
    });
    if (!expense) throw new NotFoundException('Xarajat topilmadi');
    return expense;
  }

  /**
   * Xarajatni yangilash
   */
  async updateExpense(id: string, dto: UpdateExpenseDto): Promise<ExpenseEntity> {
    const expense = await this.findById(id);
    Object.assign(expense, dto);
    return await this.expenseRepository.save(expense);
  }

  /**
   * Xarajatni soft delete qilish
   */
  async softDelete(id: string): Promise<void> {
    const expense = await this.findById(id);
    expense.is_deleted = true;
    await this.expenseRepository.save(expense);
  }

  /**
   * Umumiy xarajat summasini hisoblash (foydalanuvchi bo‘yicha)
   */
  async getTotalExpenses(userId: string): Promise<number> {
    const expenses = await this.expenseRepository.find({
      where: { user: { id: userId }, is_deleted: false },
    });

    return expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  }


  async getTotalExpensesByCategory(userId: string, categoryId: string): Promise<number> {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.category_id = :categoryId', { categoryId })
      .andWhere('expense.created_at >= :start', {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      })
      .getRawOne();

    return Number(result?.total) || 0;
  }

  async getTotalExpensesByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getRawOne();

    return Number(result?.total) || 0;
  }

  async getExpensesByCategory(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ name: string; total: number; icon?: string }>> {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.category', 'category')
      .select('category.name', 'name')
      .addSelect('category.icon', 'icon')
      .addSelect('SUM(expense.amount)', 'total')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('category.id, category.name, category.icon')
      .orderBy('total', 'DESC')
      .getRawMany();

    return result.map(item => ({
      name: item.name,
      total: Number(item.total) || 0,
      icon: item.icon,
    }));
  }

  async clearUserExpenses(userId: string): Promise<void> {
    await this.expenseRepository
      .createQueryBuilder()
      .delete()
      .from(ExpenseEntity)
      .where('userId = :userId', { userId })
      .execute();
  }

}
