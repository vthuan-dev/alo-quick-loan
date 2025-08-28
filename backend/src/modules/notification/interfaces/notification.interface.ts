import { LoanApplication } from '../../loan/schemas/loan-application.schema';

export interface NotificationData {
  to: string | string[];
  subject: string;
  content: string;
  type: NotificationType;
  metadata?: Record<string, any>;
}

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  DASHBOARD = 'DASHBOARD',
}
