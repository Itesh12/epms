import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum AssetType {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
}

export enum AssetStatus {
  STOCK = 'STOCK',
  ASSIGNED = 'ASSIGNED',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}

@Schema({ timestamps: true })
export class Asset extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ enum: AssetType, required: true })
  type: AssetType;

  @Prop({ required: true })
  category: string; // Laptop, Router, Cloud Seat, IDE License, etc.

  @Prop({ required: true, unique: true })
  identifier: string; // Serial No or License Key

  @Prop({ enum: AssetStatus, default: AssetStatus.STOCK })
  status: AssetStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assignedTo: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop()
  purchaseDate: Date;

  @Prop()
  warrantyExpiry: Date;

  // For license pools
  @Prop({ default: 0 })
  totalSeats: number;

  @Prop({ default: 0 })
  usedSeats: number;

  @Prop({ type: [{ date: Date, note: String, performedBy: String }] })
  maintenanceHistory: { date: Date; note: string; performedBy: string }[];
}

export const AssetSchema = SchemaFactory.createForClass(Asset);
