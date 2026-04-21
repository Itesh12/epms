import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum SocialPostType {
  USER = 'USER',
  WIN = 'WIN',
  ANNIVERSARY = 'ANNIVERSARY',
  NEW_HIRE = 'NEW_HIRE',
}

@Schema({ timestamps: true })
export class SocialPost extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  authorId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ enum: SocialPostType, default: SocialPostType.USER })
  type: SocialPostType;

  @Prop({ type: [String], default: [] })
  mediaUrls: string[];

  @Prop({ default: false })
  isPinned: boolean;

  @Prop({
    type: Map,
    of: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: {
      LOVE: [],
      ROCKET: [],
      CLAP: [],
      COFFEE: [],
    },
  })
  reactions: Map<string, MongooseSchema.Types.ObjectId[]>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  pinnedBy: MongooseSchema.Types.ObjectId;

  @Prop([{ type: MongooseSchema.Types.ObjectId, refPath: 'mentionModel' }])
  mentions: MongooseSchema.Types.ObjectId[];

  @Prop({ enum: ['User', 'Project'], default: 'User' })
  mentionModel: string;
}

export const SocialPostSchema = SchemaFactory.createForClass(SocialPost);
