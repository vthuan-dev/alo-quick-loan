import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LoanStatus } from '../enums/loan-status.enum';

export class QueryLoanDto {
  @ApiPropertyOptional({
    description: 'Filter by loan status',
    enum: LoanStatus,
    example: LoanStatus.PENDING,
  })
  @IsEnum(LoanStatus)
  @IsOptional()
  status?: LoanStatus;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search by phone number',
    example: '0333351725',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Search by full name',
    example: 'Nguyen Van',
  })
  @IsString()
  @IsOptional()
  fullName?: string;
}
