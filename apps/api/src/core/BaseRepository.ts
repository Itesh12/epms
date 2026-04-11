import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findByOrg(orgId: string, filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find({ ...filter, organizationId: orgId }).exec();
  }

  async findOneByOrg(orgId: string, filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne({ ...filter, organizationId: orgId }).exec();
  }

  async updateByOrg(orgId: string, id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(
      { _id: id, organizationId: orgId },
      update,
      { new: true }
    ).exec();
  }

  async deleteByOrg(orgId: string, id: string): Promise<T | null> {
    return this.model.findOneAndDelete({ _id: id, organizationId: orgId }).exec();
  }
}
