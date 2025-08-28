import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoanApplication } from '../loan/schemas/loan-application.schema';
import { NotificationData, NotificationType } from './interfaces/notification.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly adminEmails: string[] = [];
  private readonly adminPhones: string[] = [];

  constructor(private configService: ConfigService) {
    // In production, these would come from config or database
    this.adminEmails = [
      'admin@aloquickloan.com',
      'sales@aloquickloan.com',
    ];
    this.adminPhones = [
      '0815320648',
      '0927996903',
    ];
  }

  async notifyNewApplication(application: LoanApplication): Promise<void> {
    this.logger.log(`Sending notification for new loan application: ${application.loanApplicationId}`);

    // Send email notification
    await this.sendEmailNotification({
      to: this.adminEmails,
      subject: `New Loan Application - ${application.fullName}`,
      content: this.generateEmailContent(application),
      type: NotificationType.EMAIL,
      metadata: {
        applicationId: application._id,
        loanApplicationId: application.loanApplicationId,
      },
    });

    // Send SMS notification
    await this.sendSmsNotification({
      to: this.adminPhones,
      subject: 'New Loan Application',
      content: this.generateSmsContent(application),
      type: NotificationType.SMS,
      metadata: {
        applicationId: application._id,
      },
    });

    // Create dashboard notification
    await this.createDashboardNotification({
      to: 'admin',
      subject: 'New Loan Application',
      content: `New loan application from ${application.fullName}`,
      type: NotificationType.DASHBOARD,
      metadata: {
        applicationId: application._id,
        priority: 'high',
      },
    });
  }

  private async sendEmailNotification(data: NotificationData): Promise<void> {
    try {
      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      this.logger.log(`Email notification sent to: ${data.to}`);
      // Example implementation:
      // await this.emailService.send({
      //   to: data.to,
      //   subject: data.subject,
      //   html: data.content,
      // });
    } catch (error) {
      this.logger.error('Failed to send email notification:', error);
      throw error;
    }
  }

  private async sendSmsNotification(data: NotificationData): Promise<void> {
    try {
      // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
      this.logger.log(`SMS notification sent to: ${data.to}`);
      // Example implementation:
      // await this.smsService.send({
      //   to: data.to,
      //   message: data.content,
      // });
    } catch (error) {
      this.logger.error('Failed to send SMS notification:', error);
      throw error;
    }
  }

  private async createDashboardNotification(data: NotificationData): Promise<void> {
    try {
      // In production, create notification in database for admin dashboard
      this.logger.log('Dashboard notification created');
      // Example implementation:
      // await this.notificationRepository.create({
      //   type: data.type,
      //   subject: data.subject,
      //   content: data.content,
      //   metadata: data.metadata,
      //   createdAt: new Date(),
      // });
    } catch (error) {
      this.logger.error('Failed to create dashboard notification:', error);
      throw error;
    }
  }

  private generateEmailContent(application: LoanApplication): string {
    return `
      <h2>New Loan Application Received</h2>
      <p>A new loan application has been submitted and requires attention.</p>
      
      <h3>Application Details:</h3>
      <ul>
        <li><strong>Application ID:</strong> ${application.loanApplicationId}</li>
        <li><strong>Full Name:</strong> ${application.fullName}</li>
        <li><strong>Phone Number:</strong> ${application.phoneNumber}</li>
        <li><strong>Location:</strong> ${application.location || 'Not provided'}</li>
        <li><strong>Bank:</strong> ${application.bankName || 'Not provided'}</li>
        <li><strong>Submitted At:</strong> ${application.completedAt?.toLocaleString() || 'N/A'}</li>
      </ul>
      
      <h3>Contact Information:</h3>
      <ul>
        <li><strong>Primary Phone:</strong> ${application.phoneNumber}</li>
        <li><strong>Relative Phone:</strong> ${application.relativePhone || 'Not provided'}</li>
        <li><strong>Company Phone:</strong> ${application.companyPhone || 'Not provided'}</li>
      </ul>
      
      <p>Please contact the customer as soon as possible.</p>
      
      <p><a href="${this.configService.get('frontend.url')}/admin/applications/${application._id}">View Application</a>
    `;
  }

  private generateSmsContent(application: LoanApplication): string {
    return `ALO LOAN: New application from ${application.fullName} (${application.phoneNumber}). Application ID: ${application.loanApplicationId}. Please contact ASAP.`;
  }
}
