import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminLoanService } from './admin-loan.service';
import {
  AdminQueryLoanDto,
  BulkUpdateStatusDto,
  AssignLoanDto,
  AdminUpdateLoanDto,
  DashboardStatsDto,
  // ExportLoansDto, // Removed to avoid conflicts
} from './dto/admin-loan.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { LoanApplication } from './schemas/loan-application.schema';

@ApiTags('admin')
@ApiHeader({
  name: 'x-admin-api-key',
  description: 'Admin API Key',
  required: true,
})
@UseGuards(AdminAuthGuard)
@Controller('api/admin/loans')
export class AdminLoanController {
  constructor(private readonly adminLoanService: AdminLoanService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics',
    type: DashboardStatsDto,
  })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.adminLoanService.getDashboardStats();
  }

  @Get()
  @ApiOperation({ summary: 'Get loan applications with advanced filtering' })
  @ApiQuery({ type: AdminQueryLoanDto })
  @ApiResponse({
    status: 200,
    description: 'List of loan applications',
  })
  async getApplications(
    @Query(new ValidationPipe({ transform: true })) query: AdminQueryLoanDto,
  ) {
    return this.adminLoanService.getApplicationsAdmin(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Quick search for loan applications' })
  @ApiQuery({ name: 'q', description: 'Search term', required: true })
  @ApiResponse({
    status: 200,
    description: 'Search results',
  })
  async searchApplications(@Query('q') searchTerm: string) {
    return this.adminLoanService.searchApplications(searchTerm);
  }

  // Export endpoint moved to admin.controller.ts to avoid conflicts
  // @Get('export')
  // @ApiOperation({ summary: 'Export loan applications' })
  // @ApiQuery({ type: ExportLoansDto })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Export data',
  // })
  // async exportApplications(
  //   @Query(new ValidationPipe({ transform: true })) query: ExportLoansDto,
  // ) {
  //   return this.adminLoanService.exportApplications(query);
  // }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single loan application' })
  @ApiParam({ 
    name: 'id', 
    description: 'MongoDB ID or Loan Application ID (e.g., loan_xxxxxxxxxxxxx)',
    examples: {
      mongoId: { value: '68af3075aa464209b86b5a65' },
      loanId: { value: 'loan_meu6mdhhvulwd' }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Loan application details',
    type: LoanApplication,
  })
  async getApplicationById(@Param('id') id: string): Promise<LoanApplication> {
    return this.adminLoanService.getApplicationById(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get status change history' })
  @ApiParam({ 
    name: 'id', 
    description: 'MongoDB ID or Loan Application ID (e.g., loan_xxxxxxxxxxxxx)' 
  })
  @ApiResponse({
    status: 200,
    description: 'Status change history',
  })
  async getApplicationHistory(@Param('id') id: string) {
    return this.adminLoanService.getApplicationHistory(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update loan application (admin)' })
  @ApiParam({ 
    name: 'id', 
    description: 'MongoDB ID or Loan Application ID (e.g., loan_xxxxxxxxxxxxx)',
    examples: {
      mongoId: { value: '68af3075aa464209b86b5a65' },
      loanId: { value: 'loan_meu6mdhhvulwd' }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Loan application updated',
    type: LoanApplication,
  })
  async updateApplication(
    @Param('id') id: string,
    @Body() dto: AdminUpdateLoanDto,
    @Req() req: any,
  ): Promise<LoanApplication> {
    return this.adminLoanService.updateApplicationAdmin(id, dto, req.admin);
  }

  @Post('bulk/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update status' })
  @ApiResponse({
    status: 200,
    description: 'Bulk update result',
  })
  async bulkUpdateStatus(
    @Body() dto: BulkUpdateStatusDto,
    @Req() req: any,
  ) {
    return this.adminLoanService.bulkUpdateStatus(dto, req.admin);
  }

  @Patch(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign loan application to staff' })
  @ApiParam({ 
    name: 'id', 
    description: 'MongoDB ID or Loan Application ID (e.g., loan_xxxxxxxxxxxxx)' 
  })
  @ApiResponse({
    status: 200,
    description: 'Loan application assigned',
    type: LoanApplication,
  })
  async assignApplication(
    @Param('id') id: string,
    @Body() dto: AssignLoanDto,
    @Req() req: any,
  ): Promise<LoanApplication> {
    return this.adminLoanService.assignApplication(id, dto, req.admin);
  }
}

// Add missing method in AdminLoanService
export { AdminLoanService };
