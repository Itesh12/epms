import api from './api';
import { Project } from '@epms/shared';

export const getProjects = async (): Promise<Project[]> => {
  const { data } = await api.get('/projects');
  return data;
};

export const getProjectById = async (id: string): Promise<Project> => {
  const { data } = await api.get(`/projects/${id}`);
  return data;
};

export const createProject = async (project: Partial<Project>): Promise<Project> => {
  const { data } = await api.post('/projects', project);
  return data;
};

export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project> => {
  const { data } = await api.patch(`/projects/${id}`, updates);
  return data;
};
