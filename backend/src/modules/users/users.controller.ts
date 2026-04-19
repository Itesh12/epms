import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  createEmployee(@Body() createEmployeeDto: CreateEmployeeDto, @Request() req: any) {
    // In a mature app, you'd protect this with a RolesGuard so only ADMIN/MANAGER can do this.
    return this.usersService.createEmployee(createEmployeeDto, req.user.orgId);
  }

  @Get()
  getEmployees(@Request() req: any) {
    return this.usersService.findAllByOrg(req.user.orgId);
  }
  
  @Get('managers')
  getPotentialManagers(@Request() req: any) {
    return this.usersService.findPotentialManagers(req.user.orgId);
  }

  @Get('me')
  getMe(@Request() req: any) {
    return this.usersService.findById(req.user.userId, req.user.orgId);
  }

  @Patch('me/password')
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req: any) {
    return this.usersService.changePassword(req.user.userId, changePasswordDto);
  }

  @Get(':id')
  async getEmployeeById(@Param('id') id: string, @Request() req: any) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    const isSelf = req.user.userId === id;
    
    // In a production environment, you might also check if they are the direct manager.
    if (!isAdmin && !isSelf) {
      throw new UnauthorizedException('Unauthorized profile access attempt.');
    }

    return this.usersService.findById(id, req.user.orgId);
  }

  @Patch(':id')
  updateEmployee(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto, @Request() req: any) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    const isSelf = req.user.userId === id;
    
    if (!isAdmin && !isSelf) {
      throw new UnauthorizedException('Unauthorized profile modification attempt.');
    }

    // If not admin, prevent role/isActive modification
    if (!isAdmin) {
      delete updateEmployeeDto.role;
      delete updateEmployeeDto.isActive;
    }

    return this.usersService.updateEmployee(id, updateEmployeeDto, req.user.orgId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  removeEmployee(@Param('id') id: string, @Request() req: any) {
    return this.usersService.removeEmployee(id, req.user.orgId);
  }
}
