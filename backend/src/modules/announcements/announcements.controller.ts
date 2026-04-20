import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Request() req: any, @Body() data: any) {
    return this.announcementsService.create({
      ...data,
      organizationId: req.user.orgId,
      createdBy: req.user.userId,
    });
  }

  @Get()
  findAll(@Request() req: any) {
    return this.announcementsService.findAll(req.user.orgId);
  }

  @Get('active')
  findActive(@Request() req: any) {
    return this.announcementsService.findActive(req.user.orgId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Request() req: any, @Body() data: any) {
    return this.announcementsService.update(id, req.user.orgId, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.announcementsService.remove(id, req.user.orgId);
  }
}
