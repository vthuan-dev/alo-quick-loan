import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from '../twilio/twilio.service';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private configService: ConfigService,
    private twilioService: TwilioService,
  ) {}

  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      const message = `ALO Quick Loan - Ma xac thuc cua ban la: ${otp}. Ma co hieu luc trong 5 phut.`;
      
      this.logger.log(`Sending OTP to ${phoneNumber}: ${otp}`);
      
      // Check if we're in development mode and Twilio is not configured
      if (this.configService.get('NODE_ENV') === 'development' && !this.twilioService.isServiceEnabled()) {
        this.logger.warn(`[DEV MODE] OTP for ${phoneNumber}: ${otp}`);
        return true;
      }

      // Send SMS via Twilio
      const result = await this.twilioService.sendSms(phoneNumber, message);
      return result !== null;
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${phoneNumber}:`, error);
      return false;
    }
  }

  async sendNotification(phoneNumber: string, message: string): Promise<boolean> {
    try {
      this.logger.log(`Sending notification to ${phoneNumber}: ${message}`);
      
      // Check if we're in development mode and Twilio is not configured
      if (this.configService.get('NODE_ENV') === 'development' && !this.twilioService.isServiceEnabled()) {
        this.logger.warn(`[DEV MODE] Notification for ${phoneNumber}: ${message}`);
        return true;
      }

      // Send SMS via Twilio
      const result = await this.twilioService.sendSms(phoneNumber, message);
      return result !== null;
    } catch (error) {
      this.logger.error(`Failed to send notification to ${phoneNumber}:`, error);
      return false;
    }
  }
}
