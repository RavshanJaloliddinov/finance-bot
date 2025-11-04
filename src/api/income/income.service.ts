import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { IncomeEntity, UserEntity } from 'src/entities';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(IncomeEntity)
    private readonly incomeRepository: Repository<IncomeEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) { }

  /**
   * Yangi daromad qo‘shish
   */
  async createIncome(dto: CreateIncomeDto): Promise<IncomeEntity> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId, is_deleted: false },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    const income = this.incomeRepository.create({
      source: dto.source,
      amount: dto.amount,
      user,
    });

    return await this.incomeRepository.save(income);
  }

  /**
   * Foydalanuvchining barcha daromadlarini olish
   */
  async findAllByUser(userId: string): Promise<IncomeEntity[]> {
    return await this.incomeRepository.find({
      where: { user: { id: userId }, is_deleted: false },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * ID bo‘yicha daromadni olish
   */
  async findById(id: string): Promise<IncomeEntity> {
    const income = await this.incomeRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['user'],
    });
    if (!income) throw new NotFoundException('Daromad topilmadi');
    return income;
  }

  /**
   * Daromadni yangilash
   */
  async updateIncome(id: string, dto: UpdateIncomeDto): Promise<IncomeEntity> {
    const income = await this.findById(id);
    Object.assign(income, dto);
    return await this.incomeRepository.save(income);
  }

  async getTotalIncome(userId: string): Promise<number> {
    const incomes = await this.incomeRepository.find({
      where: { user: { id: userId }, is_deleted: false },
    });

    return incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
  }

  async getTotalIncomeByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await this.incomeRepository
      .createQueryBuilder('income')
      .select('SUM(income.amount)', 'total')
      .where('income.userId = :userId', { userId })
      .andWhere('income.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getRawOne();

    return Number(result?.total) || 0;
  }

  async clearUserIncomes(userId: string): Promise<void> {
    await this.incomeRepository
      .createQueryBuilder()
      .delete()
      .from(IncomeEntity)
      .where('userId = :userId', { userId }) // yoki jadvalda ustun nomi boshqacha bo'lsa moslashtiring
      .execute();
  }

}
