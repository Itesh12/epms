import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from './schemas/organization.schema';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(@InjectModel(Organization.name) private organizationModel: Model<Organization>) {}

  async getMyOrganization(orgId: string): Promise<Organization> {
    const org = await this.organizationModel.findById(orgId).exec();
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async updateOrganization(orgId: string, updateOrgDto: UpdateOrganizationDto): Promise<Organization> {
    const org = await this.organizationModel.findByIdAndUpdate(
      orgId,
      { $set: updateOrgDto },
      { new: true }
    ).exec();
    
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }
}
