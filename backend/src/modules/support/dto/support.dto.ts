import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export enum TicketType {
  IT_SUPPORT = 'IT_SUPPORT',
  GENERAL_COMPLAINT = 'GENERAL_COMPLAINT',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketCategory {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
  NETWORK = 'NETWORK',
  ACCESS = 'ACCESS',
  HARASSMENT = 'HARASSMENT',
  FACILITY = 'FACILITY',
  SALARY = 'SALARY',
  OTHER = 'OTHER',
}

export class CreateSupportTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @IsEnum(TicketType)
  type: TicketType;

  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @IsEnum(TicketCategory)
  category: TicketCategory;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @IsString()
  @IsOptional()
  relatedAssetId?: string; // Optional link to an asset
}

export class UpdateSupportTicketDto {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsString()
  @IsOptional()
  resolutionNote?: string;

  @IsString()
  @IsOptional()
  adminNote?: string;
}

export class CreateTicketCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  @IsOptional()
  isInternal?: boolean; // Only visible to admins
}
