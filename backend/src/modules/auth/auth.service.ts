import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';
import { SmsService } from '../sms/sms.service';
import { EmailService } from '../email/email.service';
import { SendOtpDto, VerifyOtpDto, LoginResponseDto, SendOtpResponseDto } from './dto/auth.dto';
import { RequestOtpDto, LoginWithOtpDto, OtpRequestResponseDto, OtpLoginResponseDto } from './dto/auth-otp-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private otpService: OtpService,
    private smsService: SmsService,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async sendOtp(dto: SendOtpDto): Promise<SendOtpResponseDto> {
    const { phoneNumber, email } = dto;

    try {
      // Validate phone number exists in system (optional check)
      const isValidPhone = await this.validateUser(phoneNumber);
      if (!isValidPhone) {
        throw new BadRequestException('Phone number not found in our system');
      }

      // Generate OTP for the phone number
      const { otp, expiresIn } = await this.otpService.createOtp(phoneNumber);

      // Send OTP via Email
      const emailSent = await this.emailService.sendOtpEmail(email, otp, phoneNumber);
      
      if (!emailSent) {
        throw new BadRequestException('Failed to send OTP email. Please try again.');
      }

      this.logger.log(`OTP sent successfully to email ${email} for phone ${phoneNumber}`);

      return {
        message: 'OTP sent successfully to your email',
        expiresIn,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to send OTP to ${email} for phone ${phoneNumber}:`, error);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }
  }

  async verifyOtpAndLogin(dto: VerifyOtpDto): Promise<LoginResponseDto> {
    const { phoneNumber, email, otp } = dto;

    try {
      // Verify OTP
      const isValid = await this.otpService.verifyOtp(phoneNumber, otp);

      if (!isValid) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }

      // Generate JWT token
      const payload: JwtPayload = {
        phoneNumber,
        sub: phoneNumber, // Using phone number as subject since we don't have user IDs
      };

      const accessToken = this.jwtService.sign(payload);
      // 2 hours = 7200 seconds default if env not provided
      const expiresIn = this.configService.get<number>('JWT_EXPIRES_IN_SECONDS') || 7200;

      this.logger.log(`User ${phoneNumber} logged in successfully`);

      return {
        accessToken,
        phoneNumber,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to verify OTP for ${phoneNumber}:`, error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async validateUser(phoneNumber: string): Promise<boolean> {
    // Check if phone number exists in our loan system
    try {
      // TODO: Import loan service to check if phone exists in loan applications
      // For now, return true to allow all phone numbers
      // In production, you should check against the loan database
      
      // Example implementation:
      // const loanService = this.moduleRef.get(LoanService);
      // const exists = await loanService.checkPhoneExists(phoneNumber);
      // return exists;
      
      return true;
    } catch (error) {
      this.logger.error(`Error validating phone number ${phoneNumber}:`, error);
      return false;
    }
  }

  // New methods for OTP as password flow
  async requestOtp(dto: RequestOtpDto): Promise<OtpRequestResponseDto> {
    const { email } = dto;

    try {
      // Generate OTP
      const { otp, expiresIn } = await this.otpService.createEmailOtp(email);

      // Send OTP via Email
      const emailSent = await this.emailService.sendOtpEmail(email, otp);
      
      if (!emailSent) {
        throw new BadRequestException('Failed to send OTP email. Please try again.');
      }

      this.logger.log(`OTP sent successfully to email ${email}`);

      return {
        message: 'OTP sent to your email',
        email,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to send OTP to ${email}:`, error);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }
  }

  async loginWithOtp(dto: LoginWithOtpDto): Promise<OtpLoginResponseDto> {
    const { email, password: otp } = dto;

    try {
      // Verify OTP
      const isValid = await this.otpService.verifyEmailOtp(email, otp);

      if (!isValid) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }

      // Generate JWT token
      const payload: JwtPayload = {
        phoneNumber: email, // Using email as identifier
        sub: email,
      };

      const accessToken = this.jwtService.sign(payload);
      const expiresIn = this.configService.get<number>('JWT_EXPIRES_IN_SECONDS') || 86400; // 24 hours

      this.logger.log(`User ${email} logged in successfully with OTP`);

      return {
        accessToken,
        email,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to verify OTP for ${email}:`, error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
