import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    icon?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;

    @IsOptional()
    @IsString()
    color?: string; 
}