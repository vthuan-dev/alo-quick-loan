import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoanApplication, LoanApplicationDocument } from './schemas/loan-application.schema';
import { 
  AdminQueryLoanDto, 
  BulkUpdateStatusDto, 
  AssignLoanDto, 
  AdminUpdateLoanDto,
  DashboardStatsDto,
  ExportLoansDto 
} from './dto/admin-loan.dto';
import { LoanStatus } from './enums/loan-status.enum';
const moment = require('moment');

@Injectable()
export class AdminLoanService {
  private readonly logger = new Logger(AdminLoanService.name);

  constructor(
    @InjectModel(LoanApplication.name)
    private loanModel: Model<LoanApplicationDocument>,
  ) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = moment().startOf('week').toDate();
    const startOfMonth = moment().startOf('month').toDate();
    const last30Days = moment().subtract(30, 'days').toDate();

    const [
      totalApplications,
      statusCounts,
      todayApplications,
      weekApplications,
      monthApplications,
      totalLoanAmountResult,
      dailyStats,
    ] = await Promise.all([
      this.loanModel.countDocuments(),
      this.loanModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.loanModel.countDocuments({ createdAt: { $gte: startOfDay } }),
      this.loanModel.countDocuments({ createdAt: { $gte: startOfWeek } }),
      this.loanModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.loanModel.aggregate([
        { $group: { _id: null, total: { $sum: '$loanAmount' } } },
      ]),
      this.loanModel.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            amount: { $sum: '$loanAmount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const statusDistribution = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    const totalLoanAmount = totalLoanAmountResult[0]?.total || 0;
    const averageLoanAmount = totalApplications > 0 ? totalLoanAmount / totalApplications : 0;

    return {
      totalApplications,
      pendingApplications: statusDistribution[LoanStatus.PENDING] || 0,
      approvedApplications: statusDistribution[LoanStatus.APPROVED] || 0,
      rejectedApplications: statusDistribution[LoanStatus.REJECTED] || 0,
      completedApplications: statusDistribution[LoanStatus.COMPLETED] || 0,
      totalLoanAmount,
      averageLoanAmount: Math.round(averageLoanAmount),
      todayApplications,
      weekApplications,
      monthApplications,
      statusDistribution,
      dailyApplications: dailyStats.map(stat => ({
        date: stat._id,
        count: stat.count,
        amount: stat.amount,
      })),
    };
  }

  async getApplicationsAdmin(query: AdminQueryLoanDto) {
    const {
      page = 1,
      limit = 20,
      status,
      phoneNumber,
      fullName,
      identityNumber,
      isCompleted,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      assignedTo,
      loanTerm,
    } = query;

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (status) filter.status = status;
    if (phoneNumber) filter.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    if (fullName) filter.fullName = { $regex: fullName, $options: 'i' };
    if (identityNumber) filter.identityNumber = { $regex: identityNumber, $options: 'i' };
    if (isCompleted !== undefined) filter.isCompleted = isCompleted;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (loanTerm) filter.loanTerm = loanTerm;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      filter.loanAmount = {};
      if (minAmount) filter.loanAmount.$gte = minAmount;
      if (maxAmount) filter.loanAmount.$lte = maxAmount;
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
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async updateApplicationAdmin(
    id: string,
    dto: AdminUpdateLoanDto,
    adminInfo?: any,
  ): Promise<LoanApplication> {
    // Try to find by MongoDB ID first, then by loan application ID
    let application = await this.loanModel.findById(id).catch(() => null);
    
    if (!application) {
      application = await this.loanModel.findOne({ loanApplicationId: id });
    }

    if (!application) {
      throw new NotFoundException('Loan application not found');
    }

    const updates: any = {};
    const statusHistoryEntry: any = {
      changedAt: new Date(),
      changedBy: adminInfo?.apiKey || 'admin',
    };

    if (dto.status && dto.status !== application.status) {
      updates.status = dto.status;
      statusHistoryEntry.status = dto.status;
      
      // Update completed status for certain statuses
      if ([LoanStatus.COMPLETED, LoanStatus.REJECTED, LoanStatus.CANCELLED].includes(dto.status)) {
        updates.isCompleted = true;
        updates.completedAt = new Date();
      }
    }

    if (dto.assignedTo !== undefined) {
      updates.assignedTo = dto.assignedTo;
    }

    if (dto.notes !== undefined) {
      updates.notes = dto.notes;
      statusHistoryEntry.notes = dto.notes;
    }

    if (dto.requestedAmount !== undefined) {
      updates.requestedAmount = dto.requestedAmount;
    }

    // Add to status history if status changed
    if (statusHistoryEntry.status) {
      if (!application.statusHistory) {
        application.statusHistory = [];
      }
      application.statusHistory.push(statusHistoryEntry);
    }

    // Apply updates
    Object.assign(application, updates);
    await application.save();

    this.logger.log(
      `Admin updated application ${application.loanApplicationId}: ${JSON.stringify(updates)}`,
    );

    return application;
  }

  async bulkUpdateStatus(
    dto: BulkUpdateStatusDto,
    adminInfo?: any,
  ): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const id of dto.applicationIds) {
      try {
        await this.updateApplicationAdmin(
          id,
          { status: dto.status, notes: dto.notes },
          adminInfo,
        );
        updated++;
      } catch (error) {
        failed++;
        this.logger.error(`Failed to update ${id}: ${error.message}`);
      }
    }

    this.logger.log(
      `Bulk update completed: ${updated} updated, ${failed} failed`,
    );

    return { updated, failed };
  }

  async assignApplication(
    id: string,
    dto: AssignLoanDto,
    adminInfo?: any,
  ): Promise<LoanApplication> {
    return this.updateApplicationAdmin(
      id,
      { assignedTo: dto.assignedTo, notes: dto.notes },
      adminInfo,
    );
  }

  async exportApplications(dto: ExportLoansDto) {
    const filter: any = {};
    
    if (dto.status) filter.status = dto.status;
    if (dto.startDate || dto.endDate) {
      filter.createdAt = {};
      if (dto.startDate) filter.createdAt.$gte = new Date(dto.startDate);
      if (dto.endDate) filter.createdAt.$lte = new Date(dto.endDate);
    }

    const applications = await this.loanModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();

    // Transform data for export
    const exportData = applications.map(app => ({
      'Application ID': app.loanApplicationId,
      'Full Name': app.fullName,
      'Phone Number': app.phoneNumber,
      'Loan Amount': app.loanAmount,
      'Loan Term': app.loanTerm,
      'Daily Payment': app.dailyPayment,
      'Status': app.status,
      'Identity Number': app.identityNumber || '',
      'Date of Birth': app.dob ? moment(app.dob).format('YYYY-MM-DD') : '',
      'Gender': app.gender || '',
      'Location': app.location || '',
      'Bank Name': app.bankName || '',
      'Bank Account': app.bankAccount || '',
      'Assigned To': app.assignedTo || '',
      'Created At': moment(app.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      'Completed': app.isCompleted ? 'Yes' : 'No',
      'Notes': app.notes || '',
    }));

    return {
      format: dto.format,
      data: exportData,
      count: exportData.length,
    };
  }

  async getApplicationHistory(id: string) {
    // Try to find by MongoDB ID first, then by loan application ID
    let application = await this.loanModel.findById(id).catch(() => null);
    
    if (!application) {
      application = await this.loanModel.findOne({ loanApplicationId: id });
    }
    
    if (!application) {
      throw new NotFoundException('Loan application not found');
    }

    return {
      currentStatus: application.status,
      history: application.statusHistory || [],
    };
  }

  async searchApplications(searchTerm: string) {
    const searchRegex = new RegExp(searchTerm, 'i');
    
    const applications = await this.loanModel
      .find({
        $or: [
          { loanApplicationId: searchRegex },
          { fullName: searchRegex },
          { phoneNumber: searchRegex },
          { identityNumber: searchRegex },
        ],
      })
      .limit(10)
      .sort({ createdAt: -1 })
      .exec();

    return applications.map(app => ({
      _id: app._id,
      loanApplicationId: app.loanApplicationId,
      fullName: app.fullName,
      phoneNumber: app.phoneNumber,
      status: app.status,
      loanAmount: app.loanAmount,
      createdAt: app.createdAt,
    }));
  }

  async getApplicationById(id: string): Promise<LoanApplication> {
    // Try to find by MongoDB ID first, then by loan application ID
    let application = await this.loanModel.findById(id).catch(() => null);
    
    if (!application) {
      application = await this.loanModel.findOne({ loanApplicationId: id });
    }
    
    if (!application) {
      throw new NotFoundException('Loan application not found');
    }

    return application;
  }
}
