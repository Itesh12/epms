import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Announcement } from './schemas/announcement.schema';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectModel(Announcement.name)
    private announcementModel: Model<Announcement>,
  ) {}

  async findAll(organizationId: string) {
    return this.announcementModel
      .find({ organizationId: organizationId as any })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActive(organizationId: string) {
    const now = new Date();
    return this.announcementModel
      .find({
        organizationId: organizationId as any,
        isActive: true,
        $or: [
          { expiresAt: { $gt: now } },
          { expiresAt: { $eq: null } }
        ]
      } as any)
      .sort({ type: 1, createdAt: -1 }) // Sort by critical first, then newest
      .exec();
  }

  async create(data: any) {
    const created = new this.announcementModel(data);
    return created.save();
  }

  async update(id: string, organizationId: string, data: any) {
    return this.announcementModel
      .findOneAndUpdate(
        { _id: id, organizationId } as any,
        data,
        { new: true }
      )
      .exec();
  }

  async remove(id: string, organizationId: string) {
    return this.announcementModel
      .findOneAndDelete({
        _id: id,
        organizationId
      } as any)
      .exec();
  }
}
