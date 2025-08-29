import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ 
    required: true, 
    enum: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT'],
    default: 'SALES'
  })
  role: string;

  @Prop({ 
    required: true, 
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  })
  status: string;

  @Prop({ default: [] })
  permissions: string[];

  @Prop({ default: null })
  lastLoginAt: Date;

  @Prop({ default: null })
  lastLoginIp: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
