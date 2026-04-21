import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  BEREAVEMENT = 'BEREAVEMENT',
  COMPENSATORY = 'COMPENSATORY',
  UNPAID = 'UNPAID',
  CASUAL = 'CASUAL',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class LeaveRequest extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ enum: LeaveType, required: true })
  type: LeaveType;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: false })
  isHalfDay: boolean;

  @Prop({ enum: ['FIRST_HALF', 'SECOND_HALF'] })
  halfDaySession: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ enum: LeaveStatus, default: LeaveStatus.PENDING })
  status: LeaveStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approverId: MongooseSchema.Types.ObjectId;

  @Prop()
  adminNote: string;

  @Prop({ default: 1 })
  daysCount: number;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
