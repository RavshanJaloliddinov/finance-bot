import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity, UserEntity } from 'src/entities';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) { }

  async create(user: UserEntity, dto: CreateCategoryDto): Promise<CategoryEntity> {
    const category = this.categoryRepository.create({
      ...dto,
      user,
      created_by: user,
    });
    return this.categoryRepository.save(category);
  }

  async findAll(userId: string): Promise<CategoryEntity[]> {
    try {
      const categories = await this.categoryRepository.find({
        where: { user: { id: userId } },
        order: { created_at: 'DESC' },
      });

      // ✅ Massiv qaytarishiga ishonch hosil qilamiz
      return categories || [];
    } catch (error) {
      console.error('Error in findAll categories:', error);
      return []; // ✅ Xatolikda bo'sh massiv qaytaramiz
    }
  }

  async findOne(id: string, userId: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id, user: { id: userId }, is_deleted: false },
      relations: ['expenses'],
    });

    if (!category) throw new NotFoundException('Kategoriya topilmadi');

    return category;
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto, user: UserEntity): Promise<CategoryEntity> {
    const category = await this.findOne(id, userId);
    Object.assign(category, dto);
    category.updated_by = user;
    return this.categoryRepository.save(category);
  }

  async clearUserCategories(userId: string): Promise<void> {
    await this.categoryRepository
      .createQueryBuilder()
      .delete()
      .from(CategoryEntity)
      .where('userId = :userId', { userId }) // userId ustun nomiga moslashtiring
      .execute();
  }

}
