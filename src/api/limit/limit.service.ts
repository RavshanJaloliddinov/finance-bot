import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LimitEntity, UserEntity, CategoryEntity } from 'src/entities';
import { CreateLimitDto } from './dto/create-limit.dto';
import { UpdateLimitDto } from './dto/update-limit.dto';

@Injectable()
export class LimitService {
  constructor(
    @InjectRepository(LimitEntity)
    private readonly limitRepository: Repository<LimitEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) { }

  async setLimit(dto: CreateLimitDto): Promise<LimitEntity> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId, is_deleted: false },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    let category = null;
    if (dto.category_id) {
      category = await this.categoryRepository.findOne({
        where: { id: dto.category_id, is_deleted: false },
      });
      if (!category) throw new NotFoundException('Kategoriya topilmadi');
    }

    const existingLimit = await this.limitRepository.findOne({
      where: {
        user: { id: user.id },
        category: category ? { id: category.id } : null,
        is_deleted: false,
      },
    });

    if (existingLimit) {
      existingLimit.amount = dto.amount;
      existingLimit.period = dto.period || 'monthly';
      return await this.limitRepository.save(existingLimit);
    }

    const limit = this.limitRepository.create({
      amount: dto.amount,
      period: dto.period || 'monthly',
      user,
      category,
    });

    return await this.limitRepository.save(limit);
  }

  async getLimit(userId: string, categoryId?: string): Promise<LimitEntity | null> {
    const query: any = {
      user: { id: userId },
      is_deleted: false,
    };

    if (categoryId) {
      query.category = { id: categoryId };
    }

    return await this.limitRepository.findOne({
      where: query,
      relations: ['category'],
    });
  }

  async getAllLimits(userId: string): Promise<LimitEntity[]> {
    return await this.limitRepository.find({
      where: { user: { id: userId }, is_deleted: false },
      relations: ['category'],
      order: { created_at: 'DESC' },
    });
  }

  async updateLimit(id: string, userId: string, dto: UpdateLimitDto): Promise<LimitEntity> {
    const limit = await this.limitRepository.findOne({
      where: { id, user: { id: userId }, is_deleted: false },
    });

    if (!limit) throw new NotFoundException('Limit topilmadi');

    Object.assign(limit, dto);
    return await this.limitRepository.save(limit);
  }

  async checkLimitStatus(
    userId: string,
    categoryId: string,
    currentExpense: number,
  ): Promise<{
    hasLimit: boolean;
    isExceeded: boolean;
    isWarning: boolean;
    percentage: number;
    limit?: number;
    remaining?: number;
  }> {
    const limit = await this.getLimit(userId, categoryId);

    if (!limit) {
      return {
        hasLimit: false,
        isExceeded: false,
        isWarning: false,
        percentage: 0,
      };
    }

    const percentage = (currentExpense / limit.amount) * 100;

    return {
      hasLimit: true,
      isExceeded: percentage >= 100,
      isWarning: percentage >= 80 && percentage < 100,
      percentage,
      limit: limit.amount,
      remaining: Math.max(0, limit.amount - currentExpense),
    };
  }

  async getTotalLimit(userId: string): Promise<LimitEntity | null> {
    return await this.limitRepository.findOne({
      where: {
        user: { id: userId },
        category: null,
        is_deleted: false,
      },
    });
  }

  async clearLimits(userId: string): Promise<void> {
    await this.limitRepository
      .createQueryBuilder()
      .delete()
      .from('limits')
      .where("userId = :userId", { userId })
      .execute();
  }

}