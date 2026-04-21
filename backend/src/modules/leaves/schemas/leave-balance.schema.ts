import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class LeaveBalance extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  year: number; // e.g., 2024

  @Prop({ type: Map, of: Number, default: {} })
  entitled: Map<string, number>; // LeaveType -> Days allowed

  @Prop({ type: Map, of: Number, default: {} })
  used: Map<string, number>; // LeaveType -> Days taken

  @Prop({ type: Map, of: Number, default: {} })
  pending: Map<string, number>; // LeaveType -> Days requested but not yet approved
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);

// Ensure one balance record per user per year
LeaveBalanceSchema.index({ userId: 1, year: 1 }, { unique: true });
