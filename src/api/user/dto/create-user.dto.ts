import { IsString, IsNumber, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    telegram_id: string;

    @IsNotEmpty()
    @IsString()
    first_name: string;

    @IsOptional()
    @IsString()
    last_name?: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    @IsEnum(['UZS', 'USD', 'EUR', 'RUB'])
    currency?: 'UZS' | 'USD' | 'EUR' | 'RUB';

    @IsOptional()
    @IsString()
    @IsEnum(['uz', 'ru', 'en'])
    language?: 'uz' | 'ru' | 'en';
}
