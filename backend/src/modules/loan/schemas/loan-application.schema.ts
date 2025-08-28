import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { LoanStatus } from '../enums/loan-status.enum';
import { Gender } from '../dto/step2.dto';

export type LoanApplicationDocument = LoanApplication & Document;

@Schema({ timestamps: true })
export class LoanApplication {
  @ApiProperty()
  _id?: string;

  @Prop({ required: true, unique: true })
  @ApiProperty()
  loanApplicationId: string;

  // Step 1 fields
  @Prop({ required: true, maxlength: 100 })
  @ApiProperty()
  fullName: string;

  @Prop({ required: true, maxlength: 15 })
  @ApiProperty()
  phoneNumber: string;

  @Prop({ required: false, min: 500000, max: 10000000 })
  @ApiProperty()
  loanAmount?: number;

  @Prop({ required: false, enum: [30, 40] })
  @ApiProperty()
  loanTerm?: number;

  @Prop({ required: false })
  @ApiProperty()
  dailyPayment?: number;

  @Prop({ required: false })
  @ApiProperty()
  totalRepayment?: number;

  // Step 2 fields
  @Prop({ type: String, enum: Gender })
  @ApiProperty({ enum: Gender })
  gender?: Gender;

  @Prop({ type: Date })
  @ApiProperty()
  dob?: Date;

  @Prop({ maxlength: 12 })
  @ApiProperty()
  identityNumber?: string;

  @Prop({ maxlength: 50 })
  @ApiProperty()
  phoneBrand?: string;

  @Prop({ maxlength: 200 })
  @ApiProperty()
  location?: string;

  // Step 3 fields
  @Prop({ maxlength: 15 })
  @ApiProperty()
  relativePhone?: string;

  @Prop({ maxlength: 15 })
  @ApiProperty()
  companyPhone?: string;

  @Prop({ maxlength: 20 })
  @ApiProperty()
  bankAccount?: string;

  @Prop({ maxlength: 100 })
  @ApiProperty()
  bankName?: string;

  // Status and tracking
  @Prop({
    type: String,
    enum: LoanStatus,
    default: LoanStatus.PENDING,
  })
  @ApiProperty({ enum: LoanStatus })
  status: LoanStatus;

  @Prop({ type: String })
  @ApiProperty()
  notes?: string;

  @Prop({ type: Number, default: 1 })
  @ApiProperty()
  currentStep: number;

  @Prop({ type: Boolean, default: false })
  @ApiProperty()
  isCompleted: boolean;

  @Prop({ type: Date })
  @ApiProperty()
  completedAt?: Date;

  @Prop({ type: Number })
  @ApiProperty()
  requestedAmount?: number;

  @Prop({ maxlength: 50 })
  @ApiProperty()
  assignedTo?: string;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;

  @Prop({
    type: [{
      status: { type: String, enum: LoanStatus },
      changedAt: { type: Date, default: Date.now },
      changedBy: String,
      notes: String,
    }],
    default: [],
  })
  @ApiProperty()
  statusHistory?: Array<{
    status: LoanStatus;
    changedAt: Date;
    changedBy?: string;
    notes?: string;
  }>;
}

export const LoanApplicationSchema = SchemaFactory.createForClass(LoanApplication);

// Add indexes
LoanApplicationSchema.index({ phoneNumber: 1 });
LoanApplicationSchema.index({ status: 1 });
LoanApplicationSchema.index({ createdAt: -1 });

// Add pre-save hook to generate loanApplicationId
LoanApplicationSchema.pre('save', function(next) {
  if (!this.loanApplicationId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.loanApplicationId = `loan_${timestamp}${random}`;
  }
  next();
});
