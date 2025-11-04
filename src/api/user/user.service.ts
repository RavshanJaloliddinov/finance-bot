import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from 'src/entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) { }

  /**
   * Foydalanuvchini yaratish yoki mavjud bo‘lsa qaytarish
   */
  async createOrFindUser(dto: CreateUserDto): Promise<UserEntity> {
    let user = await this.userRepository.findOne({
      where: { telegram_id: dto.telegram_id },
    });

    if (!user) {
      user = this.userRepository.create(dto);
      return await this.userRepository.save(user);
    }

    if (user.is_deleted) {
      user.is_deleted = false;
      return await this.userRepository.save(user);
    }

    return user;
  }

  /**
   * ID bo‘yicha foydalanuvchini olish
   */
  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['expenses', 'incomes'],
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }

  /**
   * Telegram ID bo‘yicha foydalanuvchini olish
   */
  async findByTelegramId(telegramId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { telegram_id: telegramId, is_deleted: false },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }

  /**
   * Foydalanuvchi ma’lumotlarini yangilash
   */
  async updateUser(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return await this.userRepository.save(user);
  }

  /**
   * Soft delete — foydalanuvchini faol emas deb belgilaydi
   */
  async softDeleteUser(id: string): Promise<void> {
    const user = await this.findById(id);
    user.is_deleted = true;
    await this.userRepository.save(user);
  }

  /**
   * Barcha faol foydalanuvchilarni olish
   */
  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find({
      where: { is_deleted: false },
    });
  }
}
