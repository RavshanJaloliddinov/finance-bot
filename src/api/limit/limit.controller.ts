// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// import { LimitService } from './limit.service';
// import { CreateLimitDto } from './dto/create-limit.dto';
// import { UpdateLimitDto } from './dto/update-limit.dto';

// @Controller('limit')
// export class LimitController {
//   constructor(private readonly limitService: LimitService) {}

//   @Post()
//   create(@Body() createLimitDto: CreateLimitDto) {
//     return this.limitService.create(createLimitDto);
//   }

//   @Get()
//   findAll() {
//     return this.limitService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.limitService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateLimitDto: UpdateLimitDto) {
//     return this.limitService.update(+id, updateLimitDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.limitService.remove(+id);
//   }
// }
