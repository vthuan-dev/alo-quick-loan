import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true, index: true })
  phoneNumber: string;

  @Prop({ index: true })
  email?: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({ default: 0 })
  attempts: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// Index for cleanup expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for phone number and expiration
OtpSchema.index({ phoneNumber: 1, expiresAt: -1 });

// Compound index for email and expiration
OtpSchema.index({ email: 1, expiresAt: -1 });
