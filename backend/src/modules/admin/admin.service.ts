import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { LoanApplication } from '../loan/schemas/loan-application.schema';
import { AdminCreateDto, AdminUpdateDto, AdminLoginDto, AdminProfileDto } from './dto/admin.dto';
import { LoanFilterDto, LoanUpdateDto, LoanBulkUpdateDto, LoanStatisticsDto } from './dto/loan-management.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel('LoanApplication') private loanModel: Model<LoanApplication>,
    private jwtService: JwtService,
  ) {}

  // Admin Authentication
  async adminLogin(loginDto: AdminLoginDto): Promise<{ accessToken: string; admin: any }> {
    const admin = await this.adminModel.findOne({ 
      username: loginDto.username,
      status: 'ACTIVE'
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.adminModel.updateOne(
      { _id: admin._id },
      { 
        lastLoginAt: new Date(),
        lastLoginIp: '127.0.0.1' // In production, get from request
      }
    );

    const payload = {
      sub: admin._id,
      username: admin.username,
      role: admin.role,
      permissions: admin.permissions,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      admin: {
        id: admin._id,
        username: admin.username,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    };
  }

  async createAdmin(createDto: AdminCreateDto): Promise<AdminProfileDto> {
    const existingAdmin = await this.adminModel.findOne({
      $or: [{ username: createDto.username }, { email: createDto.email }]
    });

    if (existingAdmin) {
      throw new BadRequestException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    const admin = new this.adminModel({
      ...createDto,
      password: hashedPassword,
      permissions: createDto.permissions || this.getDefaultPermissions(createDto.role),
    });

    const savedAdmin = await admin.save();
    return this.mapToProfileDto(savedAdmin);
  }

  async updateAdmin(id: string, updateDto: AdminUpdateDto): Promise<AdminProfileDto> {
    const admin = await this.adminModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true }
    );

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return this.mapToProfileDto(admin);
  }

  async getAdminProfile(id: string): Promise<AdminProfileDto> {
    const admin = await this.adminModel.findById(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return this.mapToProfileDto(admin);
  }

  async getAllAdmins(): Promise<AdminProfileDto[]> {
    const admins = await this.adminModel.find().sort({ createdAt: -1 });
    return admins.map(admin => this.mapToProfileDto(admin));
  }

  // Loan Management
  async getAllLoans(filterDto: LoanFilterDto): Promise<{ loans: any[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, phoneNumber, fullName, startDate, endDate } = filterDto;
    
    const filter: any = {};
    
    if (status) filter.status = status;
    if (phoneNumber) filter.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    if (fullName) filter.fullName = { $regex: fullName, $options: 'i' };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const total = await this.loanModel.countDocuments(filter);
    const loans = await this.loanModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('customer', 'fullName phoneNumber email');

    return {
      loans,
      total,
      page,
      limit,
    };
  }

  async getLoanById(id: string): Promise<any> {
    const loan = await this.loanModel
      .findById(id)
      .populate('customer', 'fullName phoneNumber email');
    
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return loan;
  }

  async updateLoan(id: string, updateDto: LoanUpdateDto): Promise<any> {
    const loan = await this.loanModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true }
    );

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return loan;
  }

  async bulkUpdateLoans(bulkUpdateDto: LoanBulkUpdateDto): Promise<{ updated: number; failed: number }> {
    const { loanIds, status, notes } = bulkUpdateDto;
    
    const updateData: any = { status };
    if (notes) updateData.notes = notes;

    const result = await this.loanModel.updateMany(
      { _id: { $in: loanIds } },
      updateData
    );

    return {
      updated: result.modifiedCount,
      failed: loanIds.length - result.modifiedCount,
    };
  }

  async getLoanStatistics(): Promise<LoanStatisticsDto> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalLoans,
      totalAmount,
      pendingLoans,
      approvedLoans,
      rejectedLoans,
      completedLoans,
      todayLoans,
      thisWeekLoans,
      thisMonthLoans,
    ] = await Promise.all([
      this.loanModel.countDocuments(),
      this.loanModel.aggregate([
        { $group: { _id: null, total: { $sum: '$loanAmount' } } }
      ]).then(result => result[0]?.total || 0),
      this.loanModel.countDocuments({ status: 'PENDING' }),
      this.loanModel.countDocuments({ status: 'APPROVED' }),
      this.loanModel.countDocuments({ status: 'REJECTED' }),
      this.loanModel.countDocuments({ status: 'COMPLETED' }),
      this.loanModel.countDocuments({ createdAt: { $gte: startOfDay } }),
      this.loanModel.countDocuments({ createdAt: { $gte: startOfWeek } }),
      this.loanModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    return {
      totalLoans,
      totalAmount,
      pendingLoans,
      approvedLoans,
      rejectedLoans,
      completedLoans,
      todayLoans,
      thisWeekLoans,
      thisMonthLoans,
    };
  }

  // Helper methods
  private getDefaultPermissions(role: string): string[] {
    const permissions = {
      'SUPER_ADMIN': ['*'],
      'ADMIN': ['loan:read', 'loan:write', 'loan:delete', 'admin:read', 'admin:write'],
      'SALES': ['loan:read', 'loan:write', 'customer:read'],
      'SUPPORT': ['loan:read', 'customer:read'],
    };

    return permissions[role] || [];
  }

  private mapToProfileDto(admin: AdminDocument): AdminProfileDto {
    return {
      id: admin._id.toString(),
      username: admin.username,
      fullName: admin.fullName,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      role: admin.role,
      status: admin.status,
      permissions: admin.permissions,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}
