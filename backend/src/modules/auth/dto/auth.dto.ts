import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsMobilePhone, IsNotEmpty, Length, IsEmail } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    description: 'Phone number to send OTP',
    example: '0333351725',
  })
  @IsString()
  @IsNotEmpty()
  @IsMobilePhone('vi-VN')
  phoneNumber: string;

  @ApiProperty({
    description: 'Email address to send OTP',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Phone number',
    example: '0333351725',
  })
  @IsString()
  @IsNotEmpty()
  @IsMobilePhone('vi-VN')
  phoneNumber: string;

  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '4-digit OTP code',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  otp: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Phone number of logged in user',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Expiration time in seconds',
  })
  expiresIn: number;
}

export class SendOtpResponseDto {
  @ApiProperty({
    description: 'Success message',
  })
  message: string;

  @ApiProperty({
    description: 'OTP expiration time in seconds',
  })
  expiresIn: number;
}
