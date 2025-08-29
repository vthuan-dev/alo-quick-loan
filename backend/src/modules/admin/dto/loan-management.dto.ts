import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class LoanFilterDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class LoanUpdateDto {
  @IsEnum(['PENDING', 'CONTACTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  currentStep?: number;

  @IsOptional()
  isCompleted?: boolean;
}

export class LoanBulkUpdateDto {
  @IsString({ each: true })
  loanIds: string[];

  @IsEnum(['PENDING', 'CONTACTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class LoanStatisticsDto {
  totalLoans: number;
  totalAmount: number;
  pendingLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
  completedLoans: number;
  todayLoans: number;
  thisWeekLoans: number;
  thisMonthLoans: number;
}

export class LoanExportDto {
  @IsEnum(['EXCEL', 'CSV', 'PDF'])
  format: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
