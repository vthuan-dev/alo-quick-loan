import { IsEnum, IsOptional, IsString, IsArray, IsNumber, IsDateString, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LoanStatus } from '../enums/loan-status.enum';

export class AdminQueryLoanDto {
  @ApiProperty({ required: false, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ required: false, enum: LoanStatus })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  identityNumber?: string;

  @ApiProperty({ required: false, description: 'Filter by completion status' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isCompleted?: boolean;

  @ApiProperty({ required: false, description: 'Start date for date range filter' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'End date for date range filter' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, description: 'Minimum loan amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minAmount?: number;

  @ApiProperty({ required: false, description: 'Maximum loan amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxAmount?: number;

  @ApiProperty({ required: false, description: 'Assigned staff member' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ required: false, description: 'Loan term (30 or 40 days)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  loanTerm?: number;
}

export class BulkUpdateStatusDto {
  @ApiProperty({
    description: 'Array of MongoDB IDs or Loan Application IDs (e.g., loan_xxxxxxxxxxxxx)',
    type: [String],
    example: ['loan_meu6mdhhvulwd', 'loan_abc123xyz456', '68af3075aa464209b86b5a65']
  })
  @IsArray()
  @IsString({ each: true })
  applicationIds: string[];

  @ApiProperty({
    description: 'New status to apply',
    enum: LoanStatus,
  })
  @IsEnum(LoanStatus)
  status: LoanStatus;

  @ApiProperty({
    description: 'Notes for the bulk update',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignLoanDto {
  @ApiProperty({
    description: 'Staff member to assign',
  })
  @IsString()
  assignedTo: string;

  @ApiProperty({
    description: 'Assignment notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AdminUpdateLoanDto {
  @ApiProperty({
    description: 'New status for the loan application',
    enum: LoanStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @ApiProperty({
    description: 'Staff member assignment',
    required: false,
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({
    description: 'Admin notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Requested loan amount override',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  requestedAmount?: number;
}

export class DashboardStatsDto {
  @ApiProperty()
  totalApplications: number;

  @ApiProperty()
  pendingApplications: number;

  @ApiProperty()
  approvedApplications: number;

  @ApiProperty()
  rejectedApplications: number;

  @ApiProperty()
  completedApplications: number;

  @ApiProperty()
  totalLoanAmount: number;

  @ApiProperty()
  averageLoanAmount: number;

  @ApiProperty()
  todayApplications: number;

  @ApiProperty()
  weekApplications: number;

  @ApiProperty()
  monthApplications: number;

  @ApiProperty()
  statusDistribution: Record<string, number>;

  @ApiProperty()
  dailyApplications: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
}

export class ExportLoansDto {
  @ApiProperty({ required: false, enum: ['csv', 'excel'], default: 'csv' })
  @IsOptional()
  @IsString()
  format?: 'csv' | 'excel' = 'csv';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, enum: LoanStatus })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;
}
