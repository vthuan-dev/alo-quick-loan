import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { FirebaseAuthService } from './firebase-auth.service';
import {
  SendOtpDto,
  VerifyOtpDto,
  LoginResponseDto,
  SendOtpResponseDto,
} from './dto/auth.dto';
import {
  RequestOtpDto,
  LoginWithOtpDto,
  OtpRequestResponseDto,
  OtpLoginResponseDto,
} from './dto/auth-otp-password.dto';
import {
  VerifyFirebaseTokenDto,
  FirebaseLoginResponseDto,
  InitiatePhoneAuthDto,
  InitiatePhoneAuthResponseDto,
} from './dto/firebase-auth.dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: SendOtpResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid phone number or too frequent requests',
  })
  async sendOtp(@Body() dto: SendOtpDto): Promise<SendOtpResponseDto> {
    return this.authService.sendOtp(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with phone number and OTP' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired OTP',
  })
  async login(@Body() dto: VerifyOtpDto): Promise<LoginResponseDto> {
    return this.authService.verifyOtpAndLogin(dto);
  }

  @Post('firebase/initiate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Initiate Firebase phone authentication',
    description: 'This endpoint is for documentation purposes. The actual phone verification is handled entirely on the client side using Firebase SDK.',
  })
  @ApiResponse({
    status: 200,
    description: 'Instructions for Firebase phone auth',
    type: InitiatePhoneAuthResponseDto,
  })
  async initiateFirebaseAuth(@Body() dto: InitiatePhoneAuthDto): Promise<InitiatePhoneAuthResponseDto> {
    return {
      message: `Phone verification should be initiated on the client side for ${dto.phoneNumber}`,
      instructions: 'Use Firebase Auth SDK on client to complete phone verification',
    };
  }

  @Post('firebase/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify Firebase token and login',
    description: 'Exchange a Firebase ID token for an API access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: FirebaseLoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid Firebase token' })
  async verifyFirebaseToken(@Body() dto: VerifyFirebaseTokenDto): Promise<FirebaseLoginResponseDto> {
    return this.firebaseAuthService.verifyFirebaseTokenAndLogin(dto);
  }

  // New endpoints for OTP as password flow
  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Request OTP to email',
    description: 'Send OTP to email address for passwordless login'
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully to email',
    type: OtpRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid email or too frequent requests',
  })
  async requestOtp(@Body() dto: RequestOtpDto): Promise<OtpRequestResponseDto> {
    return this.authService.requestOtp(dto);
  }

  @Post('login-with-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Login with email and OTP as password',
    description: 'Use OTP received via email as password to login'
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: OtpLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired OTP',
  })
  async loginWithOtp(@Body() dto: LoginWithOtpDto): Promise<OtpLoginResponseDto> {
    return this.authService.loginWithOtp(dto);
  }
}
