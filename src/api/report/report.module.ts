import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportService } from './report.service';
import { ExpenseModule } from '../expense/expense.module';
import { IncomeModule } from '../income/income.module';
import { CategoryModule } from '../category/category.module';
import { ReportEntity } from 'src/entities/report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportEntity]),
    ExpenseModule,
    IncomeModule,
    CategoryModule,
  ],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule { }