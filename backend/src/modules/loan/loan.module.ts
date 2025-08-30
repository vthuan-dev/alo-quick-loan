import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';
import { AdminLoanController } from './admin-loan.controller';
import { AdminLoanService } from './admin-loan.service';
import { ClientLoanController } from './client-loan.controller';
import { LoanApplication, LoanApplicationSchema } from './schemas/loan-application.schema';
import { NotificationModule } from '../notification/notification.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoanApplication.name, schema: LoanApplicationSchema },
    ]),
    NotificationModule,
    WebSocketModule,
  ],
  controllers: [LoanController, ClientLoanController], // Removed AdminLoanController to avoid route conflicts
  providers: [LoanService, AdminLoanService],
  exports: [LoanService, AdminLoanService],
})
export class LoanModule {}
