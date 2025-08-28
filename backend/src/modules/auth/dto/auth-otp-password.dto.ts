import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({
    description: 'Email address to receive OTP',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class LoginWithOtpDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '4-digit OTP code (used as password)',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  password: string; // OTP is used as password
}

export class OtpRequestResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'OTP sent to your email',
  })
  message: string;

  @ApiProperty({
    description: 'Email where OTP was sent',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'OTP expiration time in seconds',
    example: 300,
  })
  expiresIn: number;
}

export class OtpLoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 86400,
  })
  expiresIn: number;
}
