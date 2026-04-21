import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Organization extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ type: Object, default: {} })
  settings: Record<string, any>;

  @Prop()
  logoUrl: string;

  @Prop()
  subtitle: string;

  @Prop({ default: '#6366f1' })
  primaryColor: string;

  @Prop({ default: '#4338ca' })
  secondaryColor: string;

  @Prop()
  address: string;

  @Prop()
  website: string;

  @Prop()
  contactEmail: string;

  @Prop()
  industry: string;

  @Prop()
  size: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
