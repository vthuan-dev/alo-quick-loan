import { IsString, IsNotEmpty, IsMobilePhone, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoanStep3Dto {
  @ApiProperty({
    description: 'Loan application ID from previous steps',
    example: 'loan_12345678',
  })
  @IsString()
  @IsNotEmpty()
  loanApplicationId: string;

  @ApiProperty({
    description: 'Phone number of a relative',
    example: '0901234567',
  })
  @IsString()
  @IsNotEmpty()
  @IsMobilePhone('vi-VN')
  relativePhone: string;

  @ApiProperty({
    description: 'Company phone number',
    example: '0281234567',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10,11}$/, {
    message: 'Company phone must be 10-11 digits',
  })
  companyPhone: string;

  @ApiProperty({
    description: 'Bank account number',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{8,20}$/, {
    message: 'Bank account must be 8-20 digits',
  })
  bankAccount: string;

  @ApiProperty({
    description: 'Name of the bank',
    example: 'Vietcombank',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bankName: string;
}
