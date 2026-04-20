import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class WikiArticle extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string; // Markdown content

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'WikiCategory', required: true })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  authorId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 1 })
  currentVersion: number;

  @Prop({
    type: [
      {
        version: Number,
        content: String,
        authorId: { type: MongooseSchema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  history: { version: number; content: string; authorId: MongooseSchema.Types.ObjectId; createdAt: Date }[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ enum: ['DRAFT', 'PUBLISHED'], default: 'PUBLISHED' })
  status: string;
}

export const WikiArticleSchema = SchemaFactory.createForClass(WikiArticle);
