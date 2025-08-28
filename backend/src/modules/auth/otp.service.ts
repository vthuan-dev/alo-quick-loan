import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Otp, OtpDocument } from './schemas/otp.schema';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_EXPIRY_MINUTES = 1;
  private readonly MAX_ATTEMPTS = 3;
  private readonly RESEND_DELAY_SECONDS = 60;

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private configService: ConfigService,
  ) {}

  generateOtp(): string {
    // Generate 4-digit OTP
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async createOtp(phoneNumber: string, email?: string): Promise<{ otp: string; expiresIn: number }> {
    // Check if there's a recent OTP sent
    const recentOtp = await this.otpModel
      .findOne({
        phoneNumber,
        createdAt: { 
          $gte: new Date(Date.now() - this.RESEND_DELAY_SECONDS * 1000) 
        },
      })
      .sort({ createdAt: -1 });

    if (recentOtp && !recentOtp.isUsed) {
      const createdAt = recentOtp.createdAt || new Date();
      const secondsSinceCreation = 
        (Date.now() - createdAt.getTime()) / 1000;
      const remainingDelay = 
        this.RESEND_DELAY_SECONDS - secondsSinceCreation;
      
      if (remainingDelay > 0) {
        throw new BadRequestException(
          `Please wait ${Math.ceil(remainingDelay)} seconds before requesting a new OTP`
        );
      }
    }

    // Invalidate all previous OTPs for this number
    await this.otpModel.updateMany(
      { phoneNumber, isUsed: false },
      { isUsed: true }
    );

    const code = this.generateOtp();
    const expiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000
    );

    const otp = new this.otpModel({
      phoneNumber,
      email,
      code,
      expiresAt,
    });

    await otp.save();

    // Log OTP in development mode only
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.log(`🔐 Generated OTP for ${phoneNumber}: ${code}`);
      this.logger.log(`📱 This OTP will expire in ${this.OTP_EXPIRY_MINUTES} minutes`);
    }

    return {
      otp: code,
      expiresIn: this.OTP_EXPIRY_MINUTES * 60, // in seconds
    };
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
    // Log verification attempt in development
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.log(`🔍 Verifying OTP for ${phoneNumber}: ${code}`);
    }
    
    const otp = await this.otpModel.findOne({
      phoneNumber,
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      // Increment attempts on all recent OTPs for security
      await this.otpModel.updateMany(
        {
          phoneNumber,
          isUsed: false,
          expiresAt: { $gt: new Date() },
        },
        { $inc: { attempts: 1 } }
      );

      // Check if max attempts exceeded
      const recentOtp = await this.otpModel
        .findOne({
          phoneNumber,
          isUsed: false,
          expiresAt: { $gt: new Date() },
        })
        .sort({ createdAt: -1 });

      if (recentOtp && recentOtp.attempts >= this.MAX_ATTEMPTS) {
        // Invalidate the OTP
        await this.otpModel.updateMany(
          { phoneNumber, isUsed: false },
          { isUsed: true }
        );
        throw new BadRequestException(
          'Maximum attempts exceeded. Please request a new OTP'
        );
      }

      return false;
    }

    // Mark OTP as used
    otp.isUsed = true;
    await otp.save();

    // Invalidate all other OTPs for this number
    await this.otpModel.updateMany(
      { phoneNumber, isUsed: false },
      { isUsed: true }
    );

    return true;
  }

  async cleanupExpiredOtps(): Promise<void> {
    await this.otpModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }

  // Email-based OTP methods for OTP as password flow
  async createEmailOtp(email: string): Promise<{ otp: string; expiresIn: number }> {
    // Check if there's a recent OTP sent
    const recentOtp = await this.otpModel
      .findOne({
        email,
        createdAt: { 
          $gte: new Date(Date.now() - this.RESEND_DELAY_SECONDS * 1000) 
        },
      })
      .sort({ createdAt: -1 });

    if (recentOtp && !recentOtp.isUsed) {
      const createdAt = recentOtp.createdAt || new Date();
      const secondsSinceCreation = 
        (Date.now() - createdAt.getTime()) / 1000;
      const remainingDelay = 
        this.RESEND_DELAY_SECONDS - secondsSinceCreation;
      
      if (remainingDelay > 0) {
        throw new BadRequestException(
          `Please wait ${Math.ceil(remainingDelay)} seconds before requesting a new OTP`
        );
      }
    }

    // Invalidate all previous OTPs for this email
    await this.otpModel.updateMany(
      { email, isUsed: false },
      { isUsed: true }
    );

    const code = this.generateOtp();
    const expiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000
    );

    const otp = new this.otpModel({
      phoneNumber: email, // Store email in phoneNumber for backward compatibility
      email,
      code,
      expiresAt,
    });

    await otp.save();

    // Log OTP in development mode only
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.log(`🔐 Generated OTP for email ${email}: ${code}`);
      this.logger.log(`📧 This OTP will expire in ${this.OTP_EXPIRY_MINUTES} minutes`);
    }

    return {
      otp: code,
      expiresIn: this.OTP_EXPIRY_MINUTES * 60, // in seconds
    };
  }

  async verifyEmailOtp(email: string, code: string): Promise<boolean> {
    // Log verification attempt in development
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.log(`🔍 Verifying OTP for email ${email}: ${code}`);
    }
    
    const otp = await this.otpModel.findOne({
      email,
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      // Increment attempts on all recent OTPs for security
      await this.otpModel.updateMany(
        {
          email,
          isUsed: false,
          expiresAt: { $gt: new Date() },
        },
        { $inc: { attempts: 1 } }
      );

      // Check if max attempts exceeded
      const recentOtp = await this.otpModel
        .findOne({
          email,
          isUsed: false,
          expiresAt: { $gt: new Date() },
        })
        .sort({ createdAt: -1 });

      if (recentOtp && recentOtp.attempts >= this.MAX_ATTEMPTS) {
        // Invalidate the OTP
        await this.otpModel.updateMany(
          { email, isUsed: false },
          { isUsed: true }
        );
        throw new BadRequestException(
          'Maximum attempts exceeded. Please request a new OTP'
        );
      }

      return false;
    }

    // Mark OTP as used
    otp.isUsed = true;
    await otp.save();

    // Invalidate all other OTPs for this email
    await this.otpModel.updateMany(
      { email, isUsed: false },
      { isUsed: true }
    );

    return true;
  }
}
