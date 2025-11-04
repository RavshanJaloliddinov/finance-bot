import { IsString, IsNumber, IsUUID, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  category_id: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  payment_method?: string; 

  @IsOptional()
  location?: string; 
}