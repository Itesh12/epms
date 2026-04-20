import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class AssetRequest extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  assetCategory: string;

  @Prop({ required: true })
  justification: string;

  @Prop({ enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  processedBy: MongooseSchema.Types.ObjectId;

  @Prop()
  adminNote: string;
}

export const AssetRequestSchema = SchemaFactory.createForClass(AssetRequest);
