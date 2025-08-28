import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { getDatabaseConfig } from './config/database.config';
import { LoanModule } from './modules/loan/loan.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SmsModule } from './modules/sms/sms.module';
import { AuthModule } from './modules/auth/auth.module';
import { TwilioModule } from './modules/twilio/twilio.module';
import { FirebaseModule } from './modules/firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    LoanModule,
    NotificationModule,
    SmsModule,
    AuthModule,
    TwilioModule,
    FirebaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
