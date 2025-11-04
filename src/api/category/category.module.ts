import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/entities';
// import { CategoryController } from './category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule { }
