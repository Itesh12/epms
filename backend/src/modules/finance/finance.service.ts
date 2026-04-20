import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, FinanceStatus } from './schemas/expense.schema';
import { Payroll } from './schemas/payroll.schema';
import { CreateExpenseDto, UpdateExpenseStatusDto, CreatePayrollDto } from './dto/finance.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(Payroll.name) private payrollModel: Model<Payroll>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // Expenses
  async createExpense(userId: string, organizationId: string, dto: CreateExpenseDto) {
    const expense = new this.expenseModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      organizationId: new Types.ObjectId(organizationId),
      status: FinanceStatus.PENDING,
    });
    return expense.save();
  }

  async getMyExpenses(userId: string, organizationId: string) {
    return this.expenseModel
      .find({ userId: new Types.ObjectId(userId), organizationId: new Types.ObjectId(organizationId) } as any)
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllExpenses(organizationId: string) {
    return this.expenseModel
      .find({ organizationId: new Types.ObjectId(organizationId) } as any)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateExpenseStatus(id: string, organizationId: string, adminId: string, dto: UpdateExpenseStatusDto) {
    const expense = await this.expenseModel.findOne({ _id: id, organizationId } as any);
    if (!expense) throw new NotFoundException('Expense not found');

    expense.status = dto.status as FinanceStatus;
    if (dto.rejectionReason) expense.rejectionReason = dto.rejectionReason;
    expense.approvedBy = new Types.ObjectId(adminId) as any;
    
    return expense.save();
  }

  // Payroll
  async getPayrollHistory(organizationId: string, userId?: string) {
    const filter: any = { organizationId: new Types.ObjectId(organizationId) };
    if (userId) filter.userId = new Types.ObjectId(userId);
    
    return this.payrollModel
      .find(filter)
      .populate('userId', 'firstName lastName employeeId')
      .sort({ year: -1, month: -1 })
      .exec();
  }

  async generatePayroll(organizationId: string, dto: CreatePayrollDto) {
    const netAmount = dto.baseSalary + (dto.bonuses || 0) - (dto.deductions || 0);
    
    const payroll = new this.payrollModel({
      ...dto,
      organizationId: new Types.ObjectId(organizationId),
      userId: new Types.ObjectId(dto.userId),
      netAmount,
      status: FinanceStatus.PENDING,
    });
    
    return payroll.save();
  }

  async markPayrollPaid(id: string, organizationId: string) {
    return this.payrollModel.findOneAndUpdate(
      { _id: id, organizationId } as any,
      { status: FinanceStatus.PAID, paymentDate: new Date() },
      { new: true }
    );
  }

  async getFinanceSummary(organizationId: string) {
    const orgId = new Types.ObjectId(organizationId);
    
    const [pendingExpenses, totalPaidPayroll] = await Promise.all([
      this.expenseModel.countDocuments({ organizationId: orgId, status: FinanceStatus.PENDING } as any),
      this.payrollModel.aggregate([
        { $match: { organizationId: orgId, status: FinanceStatus.PAID } as any },
        { $group: { _id: null, total: { $sum: '$netAmount' } } }
      ])
    ]);

    return {
      pendingExpenses,
      totalPaidPayroll: totalPaidPayroll[0]?.total || 0,
    };
  }
}
