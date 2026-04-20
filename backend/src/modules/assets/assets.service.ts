import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Asset, AssetStatus, AssetType } from './schemas/asset.schema';
import { AssetRequest, RequestStatus } from './schemas/asset-request.schema';
import { CreateAssetDto, UpdateAssetDto, CreateAssetRequestDto, UpdateAssetRequestDto } from './dto/assets.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<Asset>,
    @InjectModel(AssetRequest.name) private requestModel: Model<AssetRequest>,
  ) {}

  async createAsset(organizationId: string, dto: CreateAssetDto) {
    const asset = new this.assetModel({
      ...dto,
      organizationId: new Types.ObjectId(organizationId),
      status: AssetStatus.STOCK,
    });
    return asset.save();
  }

  async findAll(organizationId: string, type?: AssetType) {
    const filter: any = { organizationId: new Types.ObjectId(organizationId) };
    if (type) filter.type = type;
    return this.assetModel.find(filter).populate('assignedTo', 'firstName lastName').sort({ createdAt: -1 }).exec();
  }

  async findMyAssets(userId: string, organizationId: string) {
    return this.assetModel.find({ 
      assignedTo: new Types.ObjectId(userId), 
      organizationId: new Types.ObjectId(organizationId) 
    } as any).exec();
  }

  async updateAsset(id: string, organizationId: string, dto: UpdateAssetDto) {
    const asset = await this.assetModel.findOne({ _id: id, organizationId } as any);
    if (!asset) throw new NotFoundException('Asset not found');

    if (dto.status) asset.status = dto.status;
    if (dto.assignedTo) asset.assignedTo = new Types.ObjectId(dto.assignedTo) as any;
    else if (dto.status === AssetStatus.STOCK) asset.assignedTo = null as any;

    if (dto.maintenanceNote) {
      asset.maintenanceHistory.push({
        date: new Date(),
        note: dto.maintenanceNote,
        performedBy: 'ADMIN', // Simple placeholder
      });
    }

    return asset.save();
  }

  // Requests
  async createRequest(userId: string, organizationId: string, dto: CreateAssetRequestDto) {
    const request = new this.requestModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      organizationId: new Types.ObjectId(organizationId),
      status: RequestStatus.PENDING,
    });
    return request.save();
  }

  async findAllRequests(organizationId: string) {
    return this.requestModel.find({ organizationId: new Types.ObjectId(organizationId) } as any)
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateRequestStatus(id: string, organizationId: string, adminId: string, dto: UpdateAssetRequestDto) {
    const request = await this.requestModel.findOne({ _id: id, organizationId } as any);
    if (!request) throw new NotFoundException('Request not found');

    request.status = dto.status;
    request.processedBy = new Types.ObjectId(adminId) as any;
    if (dto.adminNote) request.adminNote = dto.adminNote;

    return request.save();
  }

  async getInventorySummary(organizationId: string) {
    const orgId = new Types.ObjectId(organizationId);
    const [inStock, assigned, maintenance] = await Promise.all([
      this.assetModel.countDocuments({ organizationId: orgId, status: AssetStatus.STOCK } as any),
      this.assetModel.countDocuments({ organizationId: orgId, status: AssetStatus.ASSIGNED } as any),
      this.assetModel.countDocuments({ organizationId: orgId, status: AssetStatus.MAINTENANCE } as any),
    ]);

    const pendingRequests = await this.requestModel.countDocuments({ organizationId: orgId, status: RequestStatus.PENDING } as any);

    return {
      inStock,
      assigned,
      maintenance,
      pendingRequests,
    };
  }
}
