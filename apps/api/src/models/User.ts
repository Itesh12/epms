import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '@epms/shared';

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  organizationId?: mongoose.Types.ObjectId;
  // Profile
  phone?: string;
  personalEmail?: string;
  jobTitle?: string;
  department?: string;
  employeeId?: string;
  managerId?: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  avatar?: string;
  gender?: string;
  dateOfBirth?: Date;
  joinedAt?: Date;
  bio?: string;
  
  // Professional
  skills: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };

  // Address
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Emergency
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };

  resetPasswordCode?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE'], required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
  
  phone: { type: String },
  personalEmail: { type: String },
  jobTitle: { type: String },
  department: { type: String },
  employeeId: { type: String, index: true },
  managerId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'], default: 'ACTIVE' },
  avatar: { type: String },
  gender: { type: String },
  dateOfBirth: { type: Date },
  joinedAt: { type: Date, default: Date.now },
  bio: { type: String },

  skills: { type: [String], default: [] },
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    portfolio: String,
  },

  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },

  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },

  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
