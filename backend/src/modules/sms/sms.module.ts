import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { TwilioModule } from '../twilio/twilio.module';

@Module({
  imports: [TwilioModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
