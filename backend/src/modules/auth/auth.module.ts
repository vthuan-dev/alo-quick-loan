import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { OtpService } from './otp.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SmsModule } from '../sms/sms.module';
import { EmailModule } from '../email/email.module';
import { Otp, OtpSchema } from './schemas/otp.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Otp.name, schema: OtpSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    SmsModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthService, OtpService, JwtStrategy],
  exports: [AuthService, FirebaseAuthService, JwtStrategy],
})
export class AuthModule {}
