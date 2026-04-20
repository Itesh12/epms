import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum FeedbackStatus {
  OPEN = 'OPEN',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
}

@Schema({ timestamps: true })
export class Feedback extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  category: string; // Infrastructure, Culture, Project, Management, Other

  @Prop({ default: true })
  isAnonymous: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId; // Null if anonymous

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ enum: FeedbackStatus, default: FeedbackStatus.OPEN })
  status: FeedbackStatus;

  @Prop()
  adminNote: string;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
