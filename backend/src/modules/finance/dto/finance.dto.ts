import { IsNumber, IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { ExpenseCategory } from '../schemas/expense.schema';

export class CreateExpenseDto {
  @IsNumber()
  amount: number;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsString()
  description: string;

  @IsOptional()
  @IsUrl()
  receiptUrl?: string;
}

export class UpdateExpenseStatusDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  status: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class CreatePayrollDto {
  @IsString()
  userId: string;

  @IsNumber()
  month: number;

  @IsNumber()
  year: number;

  @IsNumber()
  baseSalary: number;

  @IsOptional()
  @IsNumber()
  bonuses?: number;

  @IsOptional()
  @IsNumber()
  deductions?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
