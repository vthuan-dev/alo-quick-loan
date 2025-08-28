import { IsString, IsNotEmpty, IsDateString, IsEnum, IsUUID, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class LoanStep2Dto {
  @ApiProperty({
    description: 'Loan application ID from step 1',
    example: 'loan_12345678',
  })
  @IsString()
  @IsNotEmpty()
  loanApplicationId: string;

  @ApiProperty({
    description: 'Gender of the applicant',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'Date of birth in yyyy-mm-dd format',
    example: '1990-01-01',
  })
  @IsDateString()
  dob: string;

  @ApiProperty({
    description: 'Identity number (CMND/CCCD)',
    example: '025123456789',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{9,12}$/, {
    message: 'Identity number must be 9-12 digits',
  })
  identityNumber: string;

  @ApiProperty({
    description: 'Phone brand being used',
    example: 'iPhone',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phoneBrand: string;

  @ApiProperty({
    description: 'Current location/address',
    example: 'Ho Chi Minh City',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string;
}
