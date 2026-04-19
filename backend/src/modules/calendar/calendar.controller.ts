import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.calendarService.findAll(req.user.organizationId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Request() req: any, @Body() body: any) {
    return this.calendarService.create({
      ...body,
      organizationId: req.user.organizationId,
      createdBy: req.user.userId,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.calendarService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.calendarService.remove(id);
  }

  @Post('seed-holidays')
  @Roles(UserRole.ADMIN)
  seedHolidays(@Request() req: any) {
    return this.calendarService.seedHolidays(req.user.organizationId, req.user.userId);
  }
}
