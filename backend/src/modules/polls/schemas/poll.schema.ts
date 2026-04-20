import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum PollStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

@Schema({ timestamps: true })
export class Poll extends Document {
  @Prop({ required: true })
  question: string;

  @Prop({
    type: [{ text: String, count: { type: Number, default: 0 } }],
    required: true,
  })
  options: { text: string; count: number }[];

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ enum: PollStatus, default: PollStatus.ACTIVE })
  status: PollStatus;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  votedUserIds: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creatorId: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isUrgent: boolean;
}

export const PollSchema = SchemaFactory.createForClass(Poll);
