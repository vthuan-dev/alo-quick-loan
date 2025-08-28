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
}
