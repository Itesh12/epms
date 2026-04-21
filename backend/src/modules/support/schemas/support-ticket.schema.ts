import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TicketType, TicketPriority, TicketStatus, TicketCategory } from '../dto/support.dto';

@Schema({ timestamps: true })
export class SupportTicket extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  requesterId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: TicketType, required: true })
  type: TicketType;

  @Prop({ enum: TicketCategory, required: true })
  category: TicketCategory;

  @Prop({ enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Prop({ enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assignedTo: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isAnonymous: boolean;

  @Prop()
  resolutionNote: string;

  @Prop()
  adminNote: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Asset' })
  relatedAssetId: MongooseSchema.Types.ObjectId;
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);

@Schema({ timestamps: true })
export class TicketComment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SupportTicket', required: true })
  ticketId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  authorId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isInternal: boolean; // Hidden from the requester if they are a regular user
}

export const TicketCommentSchema = SchemaFactory.createForClass(TicketComment);
