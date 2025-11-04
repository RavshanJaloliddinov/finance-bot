import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'src/config';
import { UserModule } from './user/user.module';
import { BudgetEntity, CategoryEntity, ExpenseEntity, IncomeEntity, LimitEntity, ReportEntity, UserEntity } from 'src/entities';
import { CategoryModule } from './category/category.module';
import { ExpenseModule } from './expense/expense.module';
import { IncomeModule } from './income/income.module';
import { BotModule } from '../bot/bot.module';
import { LimitModule } from './limit/limit.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.DB_URL,
      synchronize: true,
      entities: [UserEntity, IncomeEntity, ExpenseEntity, CategoryEntity, ReportEntity, BudgetEntity, LimitEntity,],
      ssl: false,
      // dropSchema: true 
    }),
    UserModule,
    CategoryModule,
    ExpenseModule,
    IncomeModule,
    BotModule,
    LimitModule,
    ReportModule
  ],
})
export class AppModule { }
