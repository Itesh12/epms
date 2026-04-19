import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CalendarEventDocument = CalendarEvent & Document;

export enum EventType {
  HOLIDAY = 'HOLIDAY',
  EVENT = 'EVENT',
  OFFICE_CLOSURE = 'OFFICE_CLOSURE',
  DEADLINE = 'DEADLINE',
  TEAM_OUTING = 'TEAM_OUTING',
  OTHER = 'OTHER'
}

@Schema({ timestamps: true })
export class CalendarEvent {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({
    type: String,
    enum: Object.values(EventType),
    default: EventType.EVENT
  })
  type: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent);
