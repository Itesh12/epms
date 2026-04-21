import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateLeaveRequestDto, UpdateLeaveStatusDto, AdjustBalanceDto, UpdatePolicyDto } from './dto/leaves.dto';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post('request')
  applyLeave(@Request() req: any, @Body() dto: CreateLeaveRequestDto) {
    return this.leavesService.applyLeave(req.user.userId, req.user.orgId, dto);
  }

  @Get('my')
  getMyRequests(@Request() req: any) {
    return this.leavesService.findAllRequests(req.user.orgId, req.user.userId);
  }

  @Get('balance')
  getMyBalance(@Request() req: any) {
    return this.leavesService.getOrCreateBalance(req.user.userId, req.user.orgId, new Date().getFullYear());
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  getAllRequests(@Request() req: any) {
    return this.leavesService.findAllRequests(req.user.orgId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateLeaveStatusDto) {
    return this.leavesService.updateStatus(id, req.user.orgId, req.user.userId, dto);
  }

  @Post('adjust/:userId')
  @Roles(UserRole.ADMIN)
  adjustBalance(@Param('userId') userId: string, @Request() req: any, @Body() dto: AdjustBalanceDto) {
    return this.leavesService.adjustBalance(userId, req.user.orgId, dto);
  }

  @Get('policy')
  @Roles(UserRole.ADMIN)
  getPolicy(@Request() req: any) {
    return this.leavesService.getPolicy(req.user.orgId);
  }

  @Patch('policy')
  @Roles(UserRole.ADMIN)
  updatePolicy(@Request() req: any, @Body() dto: UpdatePolicyDto) {
    return this.leavesService.updatePolicy(req.user.orgId, dto);
  }
}
