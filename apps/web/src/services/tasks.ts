import api from './api';
import { Task, TaskStatus } from '@epms/shared';

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
  const { data } = await api.get(`/tasks/project/${projectId}`);
  return data;
};

export const getMyTasks = async (): Promise<Task[]> => {
  const { data } = await api.get('/tasks/my');
  return data;
};

export const createTask = async (task: Partial<Task>): Promise<Task> => {
  const { data } = await api.post('/tasks', task);
  return data;
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  const { data } = await api.patch(`/tasks/${id}`, updates);
  return data;
};

export const addComment = async (id: string, text: string): Promise<Task> => {
  const { data } = await api.post(`/tasks/${id}/comments`, { text });
  return data;
};

export const addTime = async (id: string, timeSpent: number): Promise<Task> => {
  const { data } = await api.post(`/tasks/${id}/time`, { timeSpent });
  return data;
};
