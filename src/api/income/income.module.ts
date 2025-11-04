import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeService } from './income.service';
import { IncomeEntity, UserEntity } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeEntity, UserEntity])],
  providers: [IncomeService],
  exports: [IncomeService],
})
export class IncomeModule { }
