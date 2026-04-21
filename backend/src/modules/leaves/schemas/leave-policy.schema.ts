import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class LeavePolicy extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, unique: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Map, of: Number, default: {} })
  entitlements: Map<string, number>; // LeaveType -> Standard Days Allowed
}

export const LeavePolicySchema = SchemaFactory.createForClass(LeavePolicy);
