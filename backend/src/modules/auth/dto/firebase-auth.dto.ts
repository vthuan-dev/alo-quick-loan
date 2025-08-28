import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class VerifyFirebaseTokenDto {
  @ApiProperty({
    description: 'Firebase ID token received from client after phone authentication',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class FirebaseLoginResponseDto {
  @ApiProperty({
    description: 'JWT access token for API authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+84912345678',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Firebase user ID',
    example: 'abc123def456',
  })
  uid: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 86400,
  })
  expiresIn: number;
}

export class InitiatePhoneAuthDto {
  @ApiProperty({
    description: 'Phone number to send verification code',
    example: '+84912345678',
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;
}

export class InitiatePhoneAuthResponseDto {
  @ApiProperty({
    description: 'Message indicating the verification process has been initiated',
    example: 'Verification code sent to +84912345678. Please verify using Firebase Auth on the client side.',
  })
  message: string;

  @ApiProperty({
    description: 'Instructions for the client',
    example: 'Use Firebase Auth SDK on client to complete phone verification',
  })
  instructions: string;
}
