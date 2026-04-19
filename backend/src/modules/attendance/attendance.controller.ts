import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
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

  @Get('leaderboard')
  getLeaderboard(@Request() req: any) {
    return this.attendanceService.getLeaderboard(req.user.orgId);
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

  @Get('admin/user/:userId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getUserHistory(@Param('userId') userId: string, @Request() req: any) {
    return this.attendanceService.getUserHistory(userId, req.user.orgId);
  }

  @Post('admin/mark-absent')
  @Roles(UserRole.ADMIN)
  markAbsent(@Body('date') date: string, @Body('userIds') userIds: string[], @Request() req: any) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.attendanceService.markAbsentForDate(targetDate, req.user.orgId, userIds);
  }

  @Get('admin/missing')
  @Roles(UserRole.ADMIN)
  getMissing(@Query('date') date: string, @Request() req: any) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.attendanceService.getMissingEmployees(targetDate, req.user.orgId);
  }

  @Get('admin/live')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getLive(@Request() req: any) {
    return this.attendanceService.getLiveActivity(req.user.orgId);
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

  @Get('export')
  async export(
    @Query('userId') userId: string,
    @Query('startDate') start: string,
    @Query('endDate') end: string,
    @Request() req: any
  ) {
    // If not admin, force userId to self
    const targetUserId = req.user.role === UserRole.ADMIN ? userId : req.user.userId;
    const csv = await this.attendanceService.exportAttendance(req.user.orgId, targetUserId, start, end);
    return { csv, filename: `attendance_export_${new Date().toISOString().split('T')[0]}.csv` };
  }
}
