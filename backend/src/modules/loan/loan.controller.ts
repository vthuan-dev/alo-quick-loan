import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoanService } from './loan.service';
import { LoanStep1Dto, LoanStep1ResponseDto } from './dto/step1.dto';
import { LoanStep2Dto } from './dto/step2.dto';
import { LoanStep3Dto } from './dto/step3.dto';
import { UpdateLoanStatusDto } from './dto/update-status.dto';
import { QueryLoanDto } from './dto/query-loan.dto';
import { LoanApplication } from './schemas/loan-application.schema';
import { LoanCalculator } from './utils/loan-calculator';

@ApiTags('loan')
@Controller('api/loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get('rates')
  @ApiOperation({ summary: 'Get loan rates and available options' })
  @ApiResponse({
    status: 200,
    description: 'Loan rates information',
  })
  getRates() {
    return {
      availableAmounts: LoanCalculator.getAvailableAmounts(),
      availableTerms: LoanCalculator.getAvailableTerms(),
      rates: {
        30: [
          { amount: 500000, dailyPayment: 20500 },
          { amount: 1000000, dailyPayment: 41000 },
          { amount: 1500000, dailyPayment: 61500 },
          { amount: 2000000, dailyPayment: 82000 },
          { amount: 2500000, dailyPayment: 102000 },
          { amount: 3000000, dailyPayment: 123000 },
          { amount: 3500000, dailyPayment: 143500 },
          { amount: 4000000, dailyPayment: 164000 },
          { amount: 4500000, dailyPayment: 184500 },
          { amount: 5000000, dailyPayment: 205000 },
          { amount: 5500000, dailyPayment: 225500 },
          { amount: 6000000, dailyPayment: 246000 },
          { amount: 6500000, dailyPayment: 266500 },
          { amount: 7000000, dailyPayment: 287000 },
          { amount: 7500000, dailyPayment: 307500 },
          { amount: 8000000, dailyPayment: 328000 },
          { amount: 8500000, dailyPayment: 348500 },
          { amount: 9000000, dailyPayment: 369000 },
          { amount: 9500000, dailyPayment: 389500 },
          { amount: 10000000, dailyPayment: 410000 },
        ],
        40: [
          { amount: 500000, dailyPayment: 15375 },
          { amount: 1000000, dailyPayment: 30750 },
          { amount: 1500000, dailyPayment: 46125 },
          { amount: 2000000, dailyPayment: 61500 },
          { amount: 2500000, dailyPayment: 76875 },
          { amount: 3000000, dailyPayment: 92250 },
          { amount: 3500000, dailyPayment: 107625 },
          { amount: 4000000, dailyPayment: 123000 },
          { amount: 4500000, dailyPayment: 138375 },
          { amount: 5000000, dailyPayment: 153750 },
          { amount: 5500000, dailyPayment: 169125 },
          { amount: 6000000, dailyPayment: 184500 },
          { amount: 6500000, dailyPayment: 199875 },
          { amount: 7000000, dailyPayment: 215250 },
          { amount: 7500000, dailyPayment: 230625 },
          { amount: 8000000, dailyPayment: 246000 },
          { amount: 8500000, dailyPayment: 261375 },
          { amount: 9000000, dailyPayment: 276750 },
          { amount: 9500000, dailyPayment: 292125 },
          { amount: 10000000, dailyPayment: 307500 },
        ],
      },
    };
  }

  @Post('step1')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Step 1: Enter basic information' })
  @ApiResponse({
    status: 201,
    description: 'Loan application created successfully',
    type: LoanStep1ResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async step1(@Body() dto: LoanStep1Dto): Promise<LoanStep1ResponseDto> {
    return this.loanService.step1(dto);
  }

  @Post('step2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step 2: Enter personal information' })
  @ApiResponse({
    status: 200,
    description: 'Personal information updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Loan application not found' })
  async step2(@Body() dto: LoanStep2Dto): Promise<{ message: string }> {
    return this.loanService.step2(dto);
  }

  @Post('step3')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step 3: Enter contact & bank information' })
  @ApiResponse({
    status: 200,
    description: 'Loan application completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Loan application not found' })
  async step3(@Body() dto: LoanStep3Dto): Promise<{ message: string }> {
    return this.loanService.step3(dto);
  }

  @Get('applications')
  @ApiOperation({ summary: 'Get loan applications with filtering' })
  @ApiQuery({ name: 'status', enum: ['PENDING', 'CONTACTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'phoneNumber', type: String, required: false })
  @ApiQuery({ name: 'fullName', type: String, required: false })
  @ApiResponse({
    status: 200,
    description: 'List of loan applications',
  })
  async getApplications(
    @Query(new ValidationPipe({ transform: true })) query: QueryLoanDto,
  ) {
    return this.loanService.getApplications(query);
  }

  @Get('applications/:id')
  @ApiOperation({ summary: 'Get a single loan application by ID' })
  @ApiParam({ name: 'id', description: 'Loan application UUID' })
  @ApiResponse({
    status: 200,
    description: 'Loan application details',
    type: LoanApplication,
  })
  @ApiResponse({ status: 404, description: 'Loan application not found' })
  async getApplicationById(@Param('id') id: string): Promise<LoanApplication> {
    return this.loanService.getApplicationById(id);
  }

  @Patch('applications/:id')
  @ApiOperation({ summary: 'Update loan application status' })
  @ApiParam({ name: 'id', description: 'Loan application UUID' })
  @ApiResponse({
    status: 200,
    description: 'Loan application status updated successfully',
    type: LoanApplication,
  })
  @ApiResponse({ status: 404, description: 'Loan application not found' })
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLoanStatusDto,
  ): Promise<LoanApplication> {
    return this.loanService.updateApplicationStatus(id, dto);
  }
}
