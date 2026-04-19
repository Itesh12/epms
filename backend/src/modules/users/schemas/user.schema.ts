import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TEAM_LEADER = 'TEAM_LEADER',
  EMPLOYEE = 'EMPLOYEE',
}

export enum WorkLocation {
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ONSITE = 'ONSITE',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  FREELANCE = 'FREELANCE',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ unique: true, index: true, sparse: true })
  employeeId: string;
  
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({
    required: true,
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  })
  organizationId: MongooseSchema.Types.ObjectId;

  // Professional Info
  @Prop()
  designation: string;

  @Prop()
  department: string;

  @Prop({ enum: EmploymentType, default: EmploymentType.FULL_TIME })
  employmentType: EmploymentType;

  @Prop()
  joiningDate: Date;

  @Prop({ enum: WorkLocation, default: WorkLocation.REMOTE })
  workLocation: WorkLocation;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  reportingManager: MongooseSchema.Types.ObjectId;

  // IT & Social
  @Prop()
  techStack: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [String], default: [] })
  certifications: string[];

  @Prop()
  linkedinUrl: string;

  @Prop()
  githubUrl: string;

  @Prop()
  portfolioUrl: string;

  // Personal Info (Protected)
  @Prop()
  personalEmail: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  dob: Date;

  @Prop()
  gender: string;

  @Prop()
  maritalStatus: string;

  @Prop()
  bloodGroup: string;

  @Prop()
  currentAddress: string;

  @Prop()
  permanentAddress: string;

  // Emergency Profile
  @Prop()
  emergencyContactName: string;

  @Prop()
  emergencyContactRelation: string;

  @Prop()
  emergencyContactPhone: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
