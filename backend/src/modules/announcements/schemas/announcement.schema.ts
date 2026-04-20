import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum AnnouncementType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

@Schema({ timestamps: true })
export class Announcement extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: String,
    enum: AnnouncementType,
    default: AnnouncementType.INFO,
  })
  type: AnnouncementType;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  expiresAt: Date;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
