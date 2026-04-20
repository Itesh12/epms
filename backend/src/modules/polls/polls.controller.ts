import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PollsService } from './polls.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreatePollDto, VoteDto, CreateFeedbackDto, UpdateFeedbackDto } from './dto/polls.dto';

@Controller('polls')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  // Poll Endpoints
  @Post()
  @Roles(UserRole.ADMIN)
  createPoll(@Request() req: any, @Body() dto: CreatePollDto) {
    return this.pollsService.createPoll(req.user.userId, req.user.orgId, dto);
  }

  @Get()
  findAllPolls(@Request() req: any) {
    return this.pollsService.findAllPolls(req.user.orgId);
  }

  @Post(':id/vote')
  vote(@Param('id') id: string, @Request() req: any, @Body() dto: VoteDto) {
    return this.pollsService.vote(id, req.user.userId, req.user.orgId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deletePoll(@Param('id') id: string, @Request() req: any) {
    return this.pollsService.deletePoll(id, req.user.orgId);
  }

  // Feedback Endpoints
  @Post('feedback')
  submitFeedback(@Request() req: any, @Body() dto: CreateFeedbackDto) {
    return this.pollsService.submitFeedback(req.user.userId, req.user.orgId, dto);
  }

  @Get('feedback/all')
  @Roles(UserRole.ADMIN)
  findAllFeedback(@Request() req: any) {
    return this.pollsService.findAllFeedback(req.user.orgId);
  }

  @Patch('feedback/:id')
  @Roles(UserRole.ADMIN)
  updateFeedback(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateFeedbackDto) {
    return this.pollsService.updateFeedbackStatus(id, req.user.orgId, dto);
  }
}
