import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.tasksService.create(createTaskDto, req.user.orgId);
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @Request() req: any) {
    if (projectId) {
      return this.tasksService.findAllByProject(projectId, req.user.orgId);
    }
    return this.tasksService.findByAssignee(req.user.userId, req.user.orgId);
  }

  @Get('me')
  findMyTasks(@Request() req: any) {
    return this.tasksService.findByAssignee(req.user.userId, req.user.orgId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req: any) {
    return this.tasksService.update(id, updateTaskDto, req.user.orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.remove(id, req.user.orgId);
  }
}
