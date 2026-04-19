import { Controller, Get, Patch, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('me')
  getMyOrganization(@Request() req: any) {
    return this.organizationsService.getMyOrganization(req.user.orgId);
  }

  @Patch('me')
  updateOrganization(@Body() updateOrgDto: UpdateOrganizationDto, @Request() req: any) {
    // The user requested that only ADMIN can modify the organization settings.
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only Administrators can update organization settings.');
    }
    
    return this.organizationsService.updateOrganization(req.user.orgId, updateOrgDto);
  }
}
