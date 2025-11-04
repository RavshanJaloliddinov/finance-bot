// import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Request } from '@nestjs/common';
// import { CategoryService } from './category.service';
// import { CreateCategoryDto } from './dto/create-category.dto';
// import { UpdateCategoryDto } from './dto/update-category.dto';


// @Controller('categories')
// export class CategoryController {
//   constructor(private readonly categoryService: CategoryService) { }

//   @Post()
//   create(@Request() req, @Body() dto: CreateCategoryDto) {
//     return this.categoryService.create(req.user, dto);
//   }

//   @Get()
//   findAll(@Request() req) {
//     return this.categoryService.findAll(req.user.id);
//   }

//   @Get(':id')
//   findOne(@Request() req, @Param('id') id: string) {
//     return this.categoryService.findOne(id, req.user.id);
//   }

//   @Patch(':id')
//   update(@Request() req, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
//     return this.categoryService.update(id, req.user.id, dto, req.user);
//   }

//   @Delete(':id')
//   remove(@Request() req, @Param('id') id: string) {
//     return this.categoryService.softRemove(id, req.user.id, req.user);
//   }

//   @Patch('restore/:id')
//   restore(@Request() req, @Param('id') id: string) {
//     return this.categoryService.restore(id, req.user.id);
//   }
// }
