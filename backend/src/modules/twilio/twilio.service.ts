import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
const twilio = require('twilio');

@Injectable()
export class TwilioService implements OnModuleInit {
  private readonly logger = new Logger(TwilioService.name);
  private twilioClient: Twilio;
  private isEnabled: boolean = false;
  private twilioPhoneNumber: string | undefined;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioPhoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !this.twilioPhoneNumber) {
      this.logger.warn('Twilio configuration is missing. SMS functionality will be disabled.');
      this.logger.warn('Please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your .env file');
      this.isEnabled = false;
      return;
    }

    try {
      this.twilioClient = twilio(accountSid, authToken);
      this.isEnabled = true;
      this.logger.log('Twilio client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client:', error);
      this.isEnabled = false;
    }
  }

  async sendSms(phoneNumber: string, message: string): Promise<MessageInstance | null> {
    if (!this.isEnabled) {
      this.logger.warn('Twilio is not enabled. Cannot send SMS.');
      return null;
    }

    try {
      // Ensure phone number has country code
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      this.logger.log(`Sending SMS to ${formattedPhone}`);
      
      const messageInstance = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: formattedPhone,
      });

      this.logger.log(`SMS sent successfully. Message SID: ${messageInstance.sid}`);
      return messageInstance;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
      throw error;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any spaces or special characters
    let cleaned = phoneNumber.replace(/[\s()-]/g, '');
    
    // If the number doesn't start with +, assume it needs a country code
    if (!cleaned.startsWith('+')) {
      // Assuming Vietnam country code +84
      // If the number starts with 0, remove it
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      cleaned = '+84' + cleaned;
    }
    
    return cleaned;
  }

  isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  async verifyPhoneNumber(phoneNumber: string): Promise<boolean> {
    if (!this.isEnabled) {
      return true; // Skip verification in development
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const phoneNumberInstance = await this.twilioClient.lookups.v2
        .phoneNumbers(formattedPhone)
        .fetch();
      
      return phoneNumberInstance.valid;
    } catch (error) {
      this.logger.error(`Failed to verify phone number ${phoneNumber}:`, error);
      return false;
    }
  }
}
