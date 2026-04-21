import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  ABSENT = 'ABSENT',
  LEAVE = 'LEAVE',
}

@Schema({ timestamps: true })
export class Attendance extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, index: true })
  date: string; // YYYY-MM-DD format for easier querying by day

  @Prop({ required: true })
  checkIn: Date;

  @Prop()
  checkOut: Date;

  @Prop({
    type: [
      {
        startTime: { type: Date, required: true },
        endTime: { type: Date },
        reason: { type: String },
      },
    ],
    default: [],
  })
  breaks: {
    startTime: Date;
    endTime?: Date;
    reason?: string;
  }[];

  @Prop({ default: 0 })
  totalWorkMinutes: number;

  @Prop({
    type: String,
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Prop()
  notes: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Add compound index to ensure one record per user per day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
