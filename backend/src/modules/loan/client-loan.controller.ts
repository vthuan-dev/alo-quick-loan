import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LoanService } from './loan.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { QueryLoanDto } from './dto/query-loan.dto';
import { LoanApplication } from './schemas/loan-application.schema';

@ApiTags('client')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/client/loans')
export class ClientLoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get('my-applications')
  @ApiOperation({ summary: 'Get my loan applications' })
  @ApiResponse({
    status: 200,
    description: 'List of loan applications',
  })
  async getMyApplications(
    @CurrentUser() user: CurrentUserInfo,
    @Query(new ValidationPipe({ transform: true })) query: QueryLoanDto,
  ) {
    const queryWithPhone = {
      ...query,
      phoneNumber: user.phoneNumber,
    };
    return this.loanService.getApplications(queryWithPhone);
  }

  @Get('my-applications/:loanId')
  @ApiOperation({ summary: 'Get specific loan application details' })
  @ApiParam({ 
    name: 'loanId', 
    description: 'Loan Application ID (e.g., loan_xxxxxxxxxxxxx)',
  })
  @ApiResponse({
    status: 200,
    description: 'Loan application details',
    type: LoanApplication,
  })
  @ApiResponse({
    status: 404,
    description: 'Application not found',
  })
  async getMyApplication(
    @CurrentUser() user: CurrentUserInfo,
    @Param('loanId') loanId: string,
  ): Promise<LoanApplication> {
    // Find by loan application ID
    const application = await this.loanService.findApplicationByIdAndPhone(
      loanId,
      user.phoneNumber,
    );

    if (!application) {
      throw new NotFoundException('Loan application not found');
    }

    return application;
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get summary of my loan applications' })
  @ApiResponse({
    status: 200,
    description: 'Summary of loan applications',
  })
  async getMySummary(@CurrentUser() user: CurrentUserInfo) {
    return this.loanService.getClientSummary(user.phoneNumber);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get detailed statistics of my loans' })
  @ApiResponse({
    status: 200,
    description: 'Detailed loan statistics',
  })
  async getMyStatistics(@CurrentUser() user: CurrentUserInfo) {
    const summary = await this.loanService.getClientSummary(user.phoneNumber);
    
    // Tính toán thêm thống kê chi tiết
    const applications = await this.loanService.getApplications({
      phoneNumber: user.phoneNumber,
      limit: 1000, // Lấy tất cả để tính toán
    });

    let totalLoanAmount = 0;
    let totalPayment = 0;
    let approvedAmount = 0;
    let pendingAmount = 0;

    applications.data.forEach((app: any) => {
      if (app.loanAmount) {
        totalLoanAmount += app.loanAmount;
        
        if (app.status === 'APPROVED') {
          approvedAmount += app.loanAmount;
          if (app.totalRepayment) {
            totalPayment += app.totalRepayment;
          }
        } else if (app.status === 'PENDING') {
          pendingAmount += app.loanAmount;
        }
      }
    });

    return {
      ...summary,
      totalLoanAmount,
      totalPayment,
      approvedAmount,
      pendingAmount,
      totalApplications: applications.data.length,
    };
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent loan activity' })
  @ApiResponse({
    status: 200,
    description: 'Recent loan activity',
  })
  async getRecentActivity(@CurrentUser() user: CurrentUserInfo) {
    const applications = await this.loanService.getApplications({
      phoneNumber: user.phoneNumber,
      limit: 5,
    });

    return applications.data.map((app: any) => ({
      loanApplicationId: app.loanApplicationId,
      status: app.status,
      loanAmount: app.loanAmount,
      loanTerm: app.loanTerm,
      dailyPayment: app.dailyPayment,
      currentStep: app.currentStep,
      isCompleted: app.isCompleted,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));
  }
}
