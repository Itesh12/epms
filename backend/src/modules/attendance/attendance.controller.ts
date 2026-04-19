import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  checkIn(@Request() req: any) {
    return this.attendanceService.checkIn(req.user.userId, req.user.orgId);
  }

  @Post('check-out')
  checkOut(@Request() req: any) {
    return this.attendanceService.checkOut(req.user.userId, req.user.orgId);
  }

  @Post('break/start')
  startBreak(@Body('reason') reason: string, @Request() req: any) {
    return this.attendanceService.startBreak(req.user.userId, req.user.orgId, reason);
  }

  @Post('break/end')
  endBreak(@Request() req: any) {
    return this.attendanceService.endBreak(req.user.userId, req.user.orgId);
  }

  @Get('today')
  getTodayStatus(@Request() req: any) {
    return this.attendanceService.getTodayStatus(req.user.userId, req.user.orgId);
  }

  @Get('me')
  getMyHistory(@Request() req: any) {
    return this.attendanceService.getMyHistory(req.user.userId, req.user.orgId);
  }

  // Admin/Manager routes
  @Get('history')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getAllHistory(@Request() req: any) {
    return this.attendanceService.getAllHistory(req.user.orgId);
  }

  @Post('admin/create')
  @Roles(UserRole.ADMIN)
  adminCreate(@Body() data: any, @Request() req: any) {
    return this.attendanceService.adminCreate(data, req.user.orgId);
  }

  @Patch('admin/:id')
  @Roles(UserRole.ADMIN)
  adminUpdate(
    @Param('id') id: string,
    @Body() updateData: any,
    @Request() req: any
  ) {
    return this.attendanceService.adminUpdate(id, updateData, req.user.orgId);
  }

  @Delete('admin/:id')
  @Roles(UserRole.ADMIN)
  adminDelete(@Param('id') id: string, @Request() req: any) {
    return this.attendanceService.delete(id, req.user.orgId);
  }
}
