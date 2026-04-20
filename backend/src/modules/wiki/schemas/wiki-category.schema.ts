import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class WikiCategory extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'Book' })
  icon: string; // Lucide icon name

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'WikiCategory' })
  parentId: MongooseSchema.Types.ObjectId;
}

export const WikiCategorySchema = SchemaFactory.createForClass(WikiCategory);
