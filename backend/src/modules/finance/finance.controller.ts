import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateExpenseDto, UpdateExpenseStatusDto, CreatePayrollDto } from './dto/finance.dto';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Expenses - Employee & Admin
  @Post('expenses')
  createExpense(@Request() req: any, @Body() dto: CreateExpenseDto) {
    return this.financeService.createExpense(req.user.userId, req.user.orgId, dto);
  }

  @Get('expenses/my')
  getMyExpenses(@Request() req: any) {
    return this.financeService.getMyExpenses(req.user.userId, req.user.orgId);
  }

  // Expenses - Admin Only
  @Get('expenses/all')
  @Roles(UserRole.ADMIN)
  getAllExpenses(@Request() req: any) {
    return this.financeService.getAllExpenses(req.user.orgId);
  }

  @Patch('expenses/:id/status')
  @Roles(UserRole.ADMIN)
  updateExpenseStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateExpenseStatusDto,
  ) {
    return this.financeService.updateExpenseStatus(id, req.user.orgId, req.user.userId, dto);
  }

  // Payroll - Restricted
  @Get('payroll')
  getPayroll(@Request() req: any) {
    // Admins see all, employees see only theirs
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.userId;
    return this.financeService.getPayrollHistory(req.user.orgId, userId);
  }

  @Post('payroll/generate')
  @Roles(UserRole.ADMIN)
  generatePayroll(@Request() req: any, @Body() dto: CreatePayrollDto) {
    return this.financeService.generatePayroll(req.user.orgId, dto);
  }

  @Patch('payroll/:id/pay')
  @Roles(UserRole.ADMIN)
  markPaid(@Param('id') id: string, @Request() req: any) {
    return this.financeService.markPayrollPaid(id, req.user.orgId);
  }

  @Get('summary')
  @Roles(UserRole.ADMIN)
  getSummary(@Request() req: any) {
    return this.financeService.getFinanceSummary(req.user.orgId);
  }
}
