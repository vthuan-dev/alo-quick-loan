import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPass = this.configService.get<string>('EMAIL_PASS');
    
    // Skip email setup if credentials are not provided in development
    if (!emailUser || emailUser === 'your-email@gmail.com') {
      this.logger.warn('Email credentials not configured. Email sending will be simulated in development mode.');
      return;
    }
    
    const emailConfig = {
      host: this.configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('EMAIL_PORT', 587),
      secure: this.configService.get<boolean>('EMAIL_SECURE', false),
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Email transporter verification failed:');
        this.logger.error(`Error: ${error.message}`);
        if (error.message.includes('AUTH') || error.message.includes('credentials')) {
          this.logger.error('Authentication failed. Check your email credentials.');
          this.logger.error('For Gmail, make sure you are using an App Password, not your regular password.');
        }
      } else {
        this.logger.log('Email transporter is ready to send messages');
        this.logger.log(`Authenticated as: ${emailUser}`);
      }
    });
  }

  async sendOtpEmail(email: string, otp: string, phoneNumber?: string): Promise<boolean> {
    // Log OTP in development mode
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.log(`🔐 Email OTP for ${email}: ${otp}`);
      this.logger.log(`📧 Phone number: ${phoneNumber}`);
    }
    
    // If no transporter is configured, simulate email sending in development
    if (!this.transporter) {
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.warn(`Email not actually sent (no credentials configured)`);
        this.logger.warn(`In production, configure EMAIL_USER and EMAIL_PASS in .env`);
        return true; // Simulate successful send in development
      }
      return false; // Fail in production without credentials
    }
    
    try {
      const mailOptions = {
        from: `"ALO Quick Loan" <${this.configService.get<string>('EMAIL_FROM') || this.configService.get<string>('EMAIL_USER')}>`,
        to: email,
        subject: 'Your OTP Code - ALO Quick Loan',
        html: this.getOtpEmailTemplate(otp, phoneNumber),
        text: `Your OTP code is: ${otp}. This code will expire in 5 minutes.`,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`OTP email sent successfully to ${email}`);
      this.logger.debug(`Email message ID: ${result.messageId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      return false;
    }
  }

  private getOtpEmailTemplate(otp: string, phoneNumber?: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">ALO Quick Loan</h1>
          
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #555; margin-bottom: 20px;">Your One-Time Password (OTP)</h2>
            
            ${phoneNumber ? `<p style="color: #666;">Phone Number: <strong>${phoneNumber}</strong></p>` : ''}
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 5px;">${otp}</span>
            </div>
            
            <p style="color: #666; margin-top: 20px;">This OTP will expire in <strong>5 minutes</strong>.</p>
            
            <p style="color: #666; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      </div>
    `;
  }
}
