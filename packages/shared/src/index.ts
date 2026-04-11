import { z } from 'zod';

export const Role = z.enum(['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE']);
export type Role = z.infer<typeof Role>;

export const UserStatus = z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']);
export type UserStatus = z.infer<typeof UserStatus>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: Role,
  organizationId: z.string().optional(),
  
  // Profile Basics
  phone: z.string().optional(),
  personalEmail: z.string().email().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  employeeId: z.string().optional(),
  status: UserStatus.default('ACTIVE'),
  avatar: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  
  // Professional
  skills: z.array(z.string()).default([]),
  socialLinks: z.object({
    linkedin: z.string().optional(),
    github: z.string().optional(),
    twitter: z.string().optional(),
    portfolio: z.string().optional(),
  }).optional(),

  // Address
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),

  // Emergency Contact
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relation: z.string(),
  }).optional(),

  // Tenure
  joinedAt: z.string().optional(),
  bio: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  adminId: z.string(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterEmployeeSchema = AuthSchema.extend({
  inviteCode: z.string(),
  name: z.string(),
});
