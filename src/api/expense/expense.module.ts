import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseService } from './expense.service';
import { CategoryEntity, ExpenseEntity, UserEntity } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseEntity, UserEntity, CategoryEntity])],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
