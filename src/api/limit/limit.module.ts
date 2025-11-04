import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LimitService } from './limit.service';
import { LimitEntity, UserEntity, CategoryEntity } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([LimitEntity, UserEntity, CategoryEntity])],
  providers: [LimitService],
  exports: [LimitService],
})
export class LimitModule { }