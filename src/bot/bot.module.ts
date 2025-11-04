import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import {
    UserEntity,
    ExpenseEntity,
    IncomeEntity,
    CategoryEntity,
    LimitEntity,
    BudgetEntity,
    ReportEntity,
} from 'src/entities';
import { UserService } from 'src/api/user/user.service';
import { ExpenseService } from 'src/api/expense/expense.service';
import { IncomeService } from 'src/api/income/income.service';
import { CategoryService } from 'src/api/category/category.service';
import { LimitService } from 'src/api/limit/limit.service';
import { ReportService } from 'src/api/report/report.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            ExpenseEntity,
            IncomeEntity,
            CategoryEntity,
            LimitEntity,
            BudgetEntity,
            ReportEntity
        ]),
    ],
    providers: [
        BotUpdate,
        BotService,
        UserService,
        ExpenseService,
        IncomeService,
        CategoryService,
        LimitService,
        ReportService,
        ReportService
    ],
    exports: [BotUpdate, BotService],
})
export class BotModule { }
