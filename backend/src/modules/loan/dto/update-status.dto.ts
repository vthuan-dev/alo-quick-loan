import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoanStatus } from '../enums/loan-status.enum';

export class UpdateLoanStatusDto {
  @ApiProperty({
    description: 'New status for the loan application',
    enum: LoanStatus,
    example: LoanStatus.CONTACTED,
  })
  @IsEnum(LoanStatus)
  status: LoanStatus;

  @ApiProperty({
    description: 'Optional notes about the status update',
    example: 'Customer contacted on 2024-01-01',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
