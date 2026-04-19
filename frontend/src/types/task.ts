export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  organizationId: string;
  assigneeId?: {
    _id: string;
    email: string;
    role: string;
  };
  parentId?: string;
  dueDate?: string;
  completedAt?: string;
  estimatedHours: number;
  actualHours: number;
  createdAt: string;
  updatedAt: string;
}
