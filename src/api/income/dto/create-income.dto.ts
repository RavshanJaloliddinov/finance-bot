import { IsString, IsNumber, IsUUID, IsNotEmpty, Min, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreateIncomeDto {
    @IsNotEmpty()
    @IsString()
    source: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    amount: string;

    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(['salary', 'freelance', 'business', 'investment', 'gift', 'other'])
    type?: 'salary' | 'freelance' | 'business' | 'investment' | 'gift' | 'other';

    @IsOptional()
    @IsBoolean()
    is_recurring?: boolean;
}