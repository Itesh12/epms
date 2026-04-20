import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum ExpenseCategory {
  TRAVEL = 'TRAVEL',
  MEALS = 'MEALS',
  SOFTWARE = 'SOFTWARE',
  HARDWARE = 'HARDWARE',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  HEALTH = 'HEALTH',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHERS = 'OTHERS',
}

export enum FinanceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: ExpenseCategory, default: ExpenseCategory.OTHERS })
  category: ExpenseCategory;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: FinanceStatus, default: FinanceStatus.PENDING })
  status: FinanceStatus;

  @Prop()
  receiptUrl: string;

  @Prop()
  rejectionReason: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approvedBy: MongooseSchema.Types.ObjectId;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
