import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoanApplication, LoanApplicationDocument } from './schemas/loan-application.schema';
import { LoanStep1Dto, LoanStep1ResponseDto } from './dto/step1.dto';
import { LoanStep2Dto } from './dto/step2.dto';
import { LoanStep3Dto } from './dto/step3.dto';
import { UpdateLoanStatusDto } from './dto/update-status.dto';
import { QueryLoanDto } from './dto/query-loan.dto';
import { NotificationService } from '../notification/notification.service';
import { LoanStatus } from './enums/loan-status.enum';
import { LoanCalculator } from './utils/loan-calculator';

@Injectable()
export class LoanService {
  private readonly logger = new Logger(LoanService.name);

  constructor(
    @InjectModel(LoanApplication.name)
    private loanModel: Model<LoanApplicationDocument>,
    private notificationService: NotificationService,
  ) {}

  async step1(dto: LoanStep1Dto): Promise<LoanStep1ResponseDto> {
    // Validate loan fields are provided
    if (!dto.loanAmount || !dto.loanTerm) {
      throw new BadRequestException(
        'Loan amount and term are required',
      );
    }

    // Check if phone number already has an active application
    const existingApplication = await this.loanModel.findOne({
      phoneNumber: dto.phoneNumber,
      status: LoanStatus.PENDING,
    });

    if (existingApplication) {
      throw new BadRequestException(
        'An active loan application already exists for this phone number',
      );
    }

    // Generate unique loan application ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const loanApplicationId = `loan_${timestamp}${random}`;

    // Calculate loan details
    const loanCalculation = LoanCalculator.calculateLoan(
      dto.loanAmount,
      dto.loanTerm as 30 | 40,
    );

    // Create new loan application
    const loanApplication = new this.loanModel({
      loanApplicationId,
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      loanAmount: dto.loanAmount,
      loanTerm: dto.loanTerm,
      dailyPayment: loanCalculation.dailyPayment,
      totalRepayment: loanCalculation.totalRepayment,
      currentStep: 1,
    });

    await loanApplication.save();

    this.logger.log(`Created new loan application: ${loanApplication.loanApplicationId}`);

    return {
      loanApplicationId: loanApplication.loanApplicationId,
      message: 'Step 1 completed successfully',
      loanAmount: loanApplication.loanAmount!,
      loanTerm: loanApplication.loanTerm!,
      dailyPayment: loanApplication.dailyPayment!,
    };
  }

  async step2(dto: LoanStep2Dto): Promise<{ message: string }> {
    const loanApplication = await this.findApplicationById(dto.loanApplicationId);

    if (loanApplication.currentStep < 1) {
      throw new BadRequestException('Please complete step 1 first');
    }

    // Update application with step 2 data
    loanApplication.gender = dto.gender;
    loanApplication.dob = new Date(dto.dob);
    loanApplication.identityNumber = dto.identityNumber;
    loanApplication.phoneBrand = dto.phoneBrand;
    loanApplication.location = dto.location;
    loanApplication.currentStep = Math.max(loanApplication.currentStep, 2);

    await loanApplication.save();

    this.logger.log(`Updated loan application step 2: ${loanApplication.loanApplicationId}`);

    return {
      message: 'Step 2 completed successfully',
    };
  }

  async step3(dto: LoanStep3Dto): Promise<{ message: string }> {
    const loanApplication = await this.findApplicationById(dto.loanApplicationId);

    if (loanApplication.currentStep < 2) {
      throw new BadRequestException('Please complete step 2 first');
    }

    // Update application with step 3 data
    loanApplication.relativePhone = dto.relativePhone;
    loanApplication.companyPhone = dto.companyPhone;
    loanApplication.bankAccount = dto.bankAccount;
    loanApplication.bankName = dto.bankName;
    loanApplication.currentStep = 3;
    loanApplication.isCompleted = true;
    loanApplication.completedAt = new Date();

    await loanApplication.save();

    this.logger.log(`Completed loan application: ${loanApplication.loanApplicationId}`);

    // Send notification to admin/sales
    try {
      await this.notificationService.notifyNewApplication(loanApplication);
    } catch (error) {
      this.logger.error(`Failed to send notification for ${loanApplication.loanApplicationId}:`, error);
      // Don't fail the request if notification fails
    }

    return {
      message: 'Application submitted successfully. Our team will contact you soon.',
    };
  }

  async getApplications(query: QueryLoanDto) {
    const { page = 1, limit = 10, status, phoneNumber, fullName } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (phoneNumber) {
      filter.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    }
    
    if (fullName) {
      filter.fullName = { $regex: fullName, $options: 'i' };
    }

    const [applications, total] = await Promise.all([
      this.loanModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.loanModel.countDocuments(filter),
    ]);

    return {
      data: applications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateApplicationStatus(
    id: string,
    dto: UpdateLoanStatusDto,
  ): Promise<LoanApplication> {
    const loanApplication = await this.loanModel.findById(id);

    if (!loanApplication) {
      throw new NotFoundException('Loan application not found');
    }

    loanApplication.status = dto.status;
    
    if (dto.notes) {
      loanApplication.notes = dto.notes;
    }

    await loanApplication.save();

    this.logger.log(`Updated status for ${loanApplication.loanApplicationId} to ${dto.status}`);

    return loanApplication;
  }

  async getApplicationById(id: string): Promise<LoanApplication> {
    const loanApplication = await this.loanModel.findById(id);

    if (!loanApplication) {
      throw new NotFoundException('Loan application not found');
    }

    return loanApplication;
  }

  private async findApplicationById(loanApplicationId: string): Promise<LoanApplicationDocument> {
    const loanApplication = await this.loanModel.findOne({ loanApplicationId });

    if (!loanApplication) {
      throw new NotFoundException('Loan application not found');
    }

    return loanApplication;
  }

  async findApplicationByIdAndPhone(
    loanApplicationId: string,
    phoneNumber: string,
  ): Promise<LoanApplication | null> {
    return this.loanModel.findOne({
      loanApplicationId,
      phoneNumber,
    });
  }

  async getClientSummary(phoneNumber: string) {
    const [total, pending, approved, rejected, completed] = await Promise.all([
      this.loanModel.countDocuments({ phoneNumber }),
      this.loanModel.countDocuments({ phoneNumber, status: LoanStatus.PENDING }),
      this.loanModel.countDocuments({ phoneNumber, status: LoanStatus.APPROVED }),
      this.loanModel.countDocuments({ phoneNumber, status: LoanStatus.REJECTED }),
      this.loanModel.countDocuments({ phoneNumber, status: LoanStatus.COMPLETED }),
    ]);

    const latestApplication = await this.loanModel
      .findOne({ phoneNumber })
      .sort({ createdAt: -1 });

    return {
      totalApplications: total,
      pendingApplications: pending,
      approvedApplications: approved,
      rejectedApplications: rejected,
      completedApplications: completed,
      latestApplication: latestApplication ? {
        loanApplicationId: latestApplication.loanApplicationId,
        status: latestApplication.status,
        loanAmount: latestApplication.loanAmount,
        createdAt: latestApplication.createdAt,
      } : null,
    };
  }
}
