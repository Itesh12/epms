import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { FinanceStatus } from './expense.schema';

@Schema({ timestamps: true })
export class Payroll extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  month: number; // 0-11 or 1-12

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  baseSalary: number;

  @Prop({ default: 0 })
  bonuses: number;

  @Prop({ default: 0 })
  deductions: number;

  @Prop({ required: true })
  netAmount: number;

  @Prop({ enum: [FinanceStatus.PENDING, FinanceStatus.PAID], default: FinanceStatus.PENDING })
  status: FinanceStatus;

  @Prop()
  paymentDate: Date;

  @Prop()
  notes: string;
}

export const PayrollSchema = SchemaFactory.createForClass(Payroll);
