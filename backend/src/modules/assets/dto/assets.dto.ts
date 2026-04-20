import { IsString, IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { AssetType, AssetStatus } from '../schemas/asset.schema';
import { RequestStatus } from '../schemas/asset-request.schema';

export class CreateAssetDto {
  @IsString()
  name: string;

  @IsEnum(AssetType)
  type: AssetType;

  @IsString()
  category: string;

  @IsString()
  identifier: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsDateString()
  warrantyExpiry?: string;

  @IsOptional()
  @IsNumber()
  totalSeats?: number;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  maintenanceNote?: string;
}

export class CreateAssetRequestDto {
  @IsString()
  assetCategory: string;

  @IsString()
  justification: string;
}

export class UpdateAssetRequestDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
