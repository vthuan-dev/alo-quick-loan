import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AdminCreateDto, AdminUpdateDto, AdminLoginDto } from './dto/admin.dto';
import { LoanFilterDto, LoanUpdateDto, LoanBulkUpdateDto } from './dto/loan-management.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Admin Authentication
  @Post('login')
  async adminLogin(@Body() loginDto: AdminLoginDto) {
    return this.adminService.adminLogin(loginDto);
  }

  @Get('profile')
  @UseGuards(AdminAuthGuard)
  async getProfile(@Request() req) {
    return this.adminService.getAdminProfile(req.user.sub);
  }

  // Admin Management (Super Admin only)
  @Post('admins')
  @UseGuards(AdminAuthGuard)
  async createAdmin(@Body() createDto: AdminCreateDto, @Request() req) {
    // Check if user has permission to create admin
    if (!req.user.permissions.includes('*') && !req.user.permissions.includes('admin:write')) {
      throw new Error('Insufficient permissions');
    }
    return this.adminService.createAdmin(createDto);
  }

  @Get('admins')
  @UseGuards(AdminAuthGuard)
  async getAllAdmins(@Request() req) {
    // Check if user has permission to read admin list
    if (!req.user.permissions.includes('*') && !req.user.permissions.includes('admin:read')) {
      throw new Error('Insufficient permissions');
    }
    return this.adminService.getAllAdmins();
  }

  @Put('admins/:id')
  @UseGuards(AdminAuthGuard)
  async updateAdmin(@Param('id') id: string, @Body() updateDto: AdminUpdateDto, @Request() req) {
    // Check if user has permission to update admin
    if (!req.user.permissions.includes('*') && !req.user.permissions.includes('admin:write')) {
      throw new Error('Insufficient permissions');
    }
    return this.adminService.updateAdmin(id, updateDto);
  }

  // Loan Management
  @Get('loans')
  @UseGuards(AdminAuthGuard)
  async getAllLoans(@Query() filterDto: LoanFilterDto, @Request() req) {
    // Check if user has permission to read loans
    if (!req.user.permissions.includes('*') && !req.user.permissions.includes('loan:read')) {
      throw new Error('Insufficient permissions');
    }
    return this.adminService.getAllLoans(filterDto);
  }

  // Export loans for report - MUST be before :id route
  @Get('loans/export')
  @UseGuards(AdminAuthGuard)
  async exportLoans(@Query() filterDto: LoanFilterDto, @Request() req) {
    if (!req.user.permissions.includes('*') && !req.user.permissions.includes('loan:read')) {
      throw new Error('Insufficient permissions');
    }
    return this.adminService.exportLoans(filterDto);
  }

  @Get('loans/:id')
  @UseGuards(AdminAuthGuard)
  async getLoanById(@Param('id') id: string, @Request() req) {
    if (!req.user.permissions.includes('*') && !req.user.permissions.includes('loan:read')) {
      throw new Error('Insufficient permissions');
    }
    return this.adminService.getLoanById(id);
  }

  @Put('loans/:id')
  @UseGuards(AdminAuthGuard)
  async updateLoan(@Param('id') id: string, @Body() updateDto: LoanUpdateDto, @Request() req) {
    if (!req.user.permissions.includes('*') && !req.user.permissions.includes('loan:write')) {
      throw new Error('Insufficient permissions');
    }
    return this.adminService.updateLoan(id, updateDto);
  }

  @Post('loans/bulk-update')
  @UseGuards(AdminAuthGuard)
  async bulkUpdateLoans(@Body() bulkUpdateDto: LoanBulkUpdateDto, @Request() req) {
    if (!req.user.permissions.includes('*') && !req.user.permissions.includes('loan:write')) {
      throw new Error('Insufficient permissions');
    }
    return this.adminService.bulkUpdateLoans(bulkUpdateDto);
  }

  // Statistics
  @Get('statistics')
  @UseGuards(AdminAuthGuard)
  async getStatistics(@Request() req) {
    if (!req.user.permissions.includes('*') && !req.user.permissions.includes('loan:read')) {
      throw new Error('Insufficient permissions');
    }
    return this.adminService.getLoanStatistics();
  }

  // Dashboard data
  @Get('dashboard')
  @UseGuards(AdminAuthGuard)
  async getDashboardData(@Request() req) {
    if (!req.user.permissions.includes('*') && !req.user.permissions.includes('loan:read')) {
      throw new Error('Insufficient permissions');
    }

    const [statistics, recentLoans] = await Promise.all([
      this.adminService.getLoanStatistics(),
      this.adminService.getAllLoans({ page: 1, limit: 5 }),
    ]);

    return {
      statistics,
      recentLoans: recentLoans.loans,
      adminInfo: {
        id: req.user.sub,
        username: req.user.username,
        role: req.user.role,
        permissions: req.user.permissions,
      },
    };
  }

  // Change password
  @Post('change-password')
  @UseGuards(AdminAuthGuard)
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req) {
    return this.adminService.changePassword(req.user.sub, changePasswordDto);
  }

}
