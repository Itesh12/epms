import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class SocialComment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SocialPost', required: true, index: true })
  postId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  authorId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];
}

export const SocialCommentSchema = SchemaFactory.createForClass(SocialComment);
