import { IsNotEmpty, IsNumber, IsOptional, IsEnum, IsString, IsBoolean, Min } from 'class-validator';

export class CreateLimitDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsOptional()
    @IsString()
    category_id?: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    amount: number;

    @IsOptional()
    @IsEnum(['daily', 'weekly', 'monthly', 'yearly'])
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';

    @IsOptional()
    @IsBoolean()
    notify_on_warning?: boolean;

    @IsOptional()
    @IsBoolean()
    notify_on_exceed?: boolean;
}