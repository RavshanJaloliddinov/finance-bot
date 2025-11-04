import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseService } from '../expense/expense.service';
import { IncomeService } from '../income/income.service';
import { CategoryService } from '../category/category.service';
import { ReportEntity } from 'src/entities/report.entity';
import { UserEntity } from 'src/entities';
@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportRepository: Repository<ReportEntity>,
    private readonly expenseService: ExpenseService,
    private readonly incomeService: IncomeService,
    private readonly categoryService: CategoryService,
  ) { }

  async generateReport(userId: string, period: 'today' | 'week' | 'month' | 'year') {
    // Davrni hisoblash
    const dateRange = this.calculateDateRange(period);

    // Daromad va xarajatlarni olish
    const totalIncome = await this.incomeService.getTotalIncomeByPeriod(
      userId,
      dateRange.start,
      dateRange.end
    );

    const totalExpense = await this.expenseService.getTotalExpensesByPeriod(
      userId,
      dateRange.start,
      dateRange.end
    );

    // Kategoriyalar bo'yicha xarajatlar
    const expensesByCategory = await this.expenseService.getExpensesByCategory(
      userId,
      dateRange.start,
      dateRange.end
    );

    // Report yaratish - user obyekti bilan
    const report = this.reportRepository.create({
      period,
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
      expenses_by_category: expensesByCategory,
      user: { id: userId } as UserEntity,
    });

    // Reportni saqlash
    await this.reportRepository.save(report);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      expensesByCategory,
      period,
    };
  }

  async getUserReports(userId: string, limit = 10) {
    return this.reportRepository.find({
      where: { user: { id: userId } }, // Relation orqali filter
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getReportById(id: string, userId: string) {
    return this.reportRepository.findOne({
      where: { id, user: { id: userId } }, // Relation orqali filter
    });
  }

  async deleteReport(id: string, userId: string) {
    return this.reportRepository.delete({
      id,
      user: { id: userId } // Relation orqali filter
    });
  }

  async getUserReportsWithUser(userId: string) {
    return this.reportRepository.find({
      where: { user: { id: userId } },
      relations: ['user'], // User ma'lumotlarini ham oladi
      order: { created_at: 'DESC' },
    });
  }

  private calculateDateRange(period: 'today' | 'week' | 'month' | 'year') {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  }

  async clearUserData(userId: string): Promise<void> {

    // Barcha reportlarni o'chirish
    await this.reportRepository
      .createQueryBuilder()
      .delete()
      .from(ReportEntity)
      .where('userId = :userId', { userId })
      .execute();
  }

}