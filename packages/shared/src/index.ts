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

// Attendance Types
export const ActivityType = z.enum(['WORK', 'BREAK']);
export type ActivityType = z.infer<typeof ActivityType>;

export const AttendanceStatus = z.enum(['PRESENT', 'ABSENT', 'LATE', 'ON_BREAK', 'NOT_STARTED']);
export type AttendanceStatus = z.infer<typeof AttendanceStatus>;

export const AttendanceActivitySchema = z.object({
  startTime: z.string(),
  endTime: z.string().optional(),
  type: ActivityType,
  note: z.string().optional(),
});
export type AttendanceActivity = z.infer<typeof AttendanceActivitySchema>;

export const AttendanceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  date: z.string(), // ISO Date string (YYYY-MM-DD)
  activities: z.array(AttendanceActivitySchema),
  totalWorkMinutes: z.number().default(0),
  totalBreakMinutes: z.number().default(0),
  status: AttendanceStatus.default('NOT_STARTED'),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
});
export type Attendance = z.infer<typeof AttendanceSchema>;

export const CorrectionStatus = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export type CorrectionStatus = z.infer<typeof CorrectionStatus>;

export const AttendanceCorrectionSchema = z.object({
  id: z.string(),
  attendanceId: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  requestedAt: z.string(),
  reason: z.string(),
  correctionType: z.enum(['CHECK_IN', 'CHECK_OUT', 'BREAK']),
  originalTime: z.string().optional(),
  requestedTime: z.string(),
  status: CorrectionStatus.default('PENDING'),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
  adminComment: z.string().optional(),
});
export type AttendanceCorrection = z.infer<typeof AttendanceCorrectionSchema>;

// Project Management Types
export const ProjectStatus = z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD']);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

export const ProjectSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: ProjectStatus.default('ACTIVE'),
  members: z.array(z.string()), // user IDs
  createdBy: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

// Task Management Types
export const TaskStatus = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const TaskPriority = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export type TaskPriority = z.infer<typeof TaskPriority>;

export const TaskCommentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  text: z.string(),
  createdAt: z.string(),
});
export type TaskComment = z.infer<typeof TaskCommentSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  organizationId: z.string(),
  assigneeId: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  status: TaskStatus.default('TODO'),
  priority: TaskPriority.default('MEDIUM'),
  deadline: z.string().optional(),
  position: z.number().default(0), // For Kanban order
  timeSpent: z.number().default(0), // In seconds
  comments: z.array(TaskCommentSchema).default([]),
  createdBy: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Task = z.infer<typeof TaskSchema>;
