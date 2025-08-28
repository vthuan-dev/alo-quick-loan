import { IsString, IsNotEmpty, IsMobilePhone, MaxLength, IsNumber, Min, Max, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoanStep1Dto {
  @ApiProperty({
    description: 'Full name of the applicant',
    example: 'Nguyen Van A',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: 'Phone number of the applicant',
    example: '0333351725',
  })
  @IsString()
  @IsNotEmpty()
  @IsMobilePhone('vi-VN')
  phoneNumber: string;

  @ApiProperty({
    description: 'Loan amount requested (in VND)',
    example: 2500000,
    minimum: 500000,
    maximum: 10000000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(500000)
  @Max(10000000)
  loanAmount: number;

  @ApiProperty({
    description: 'Loan term in days',
    example: 30,
    enum: [30, 40],
  })
  @IsNumber()
  @IsNotEmpty()
  @IsIn([30, 40])
  loanTerm: number;
}

export class LoanStep1ResponseDto {
  @ApiProperty({
    description: 'Unique loan application ID',
    example: 'loan_12345678',
  })
  loanApplicationId: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Step 1 completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Loan amount in VND',
    example: 2500000,
  })
  loanAmount: number;

  @ApiProperty({
    description: 'Loan term in days',
    example: 30,
  })
  loanTerm: number;

  @ApiProperty({
    description: 'Daily payment amount in VND',
    example: 102000,
  })
  dailyPayment: number;
}
