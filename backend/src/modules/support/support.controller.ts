import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { CreateSupportTicketDto, UpdateSupportTicketDto, CreateTicketCommentDto } from './dto/support.dto';

@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  createTicket(@Request() req: any, @Body() dto: CreateSupportTicketDto) {
    return this.supportService.createTicket(req.user.userId, req.user.orgId, dto);
  }

  @Get('tickets')
  findAll(@Request() req: any) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.supportService.findAll(req.user.orgId, isAdmin, req.user.userId);
  }

  @Get('tickets/stats')
  getStats(@Request() req: any) {
    return this.supportService.getStats(req.user.orgId);
  }

  @Get('tickets/:id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.supportService.findOne(id, req.user.orgId, req.user.userId, isAdmin);
  }

  @Patch('tickets/:id')
  updateTicket(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateSupportTicketDto) {
    // Only admins can currently update ticket details/status
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Only admins can update tickets'); // Standard roles guard handle this but double check
    }
    return this.supportService.updateTicket(id, req.user.orgId, req.user.userId, dto);
  }

  @Post('tickets/:id/comments')
  addComment(@Param('id') id: string, @Request() req: any, @Body() dto: CreateTicketCommentDto) {
    return this.supportService.addComment(id, req.user.userId, dto);
  }

  @Get('tickets/:id/comments')
  getComments(@Param('id') id: string, @Request() req: any) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.supportService.getComments(id, isAdmin);
  }
}
