import api from './api';
import { AttendanceStats, ProductivityStats, ProjectPerformance, InsightPattern } from '@epms/shared';

export const getAttendanceAnalytics = async (): Promise<AttendanceStats> => {
  const { data } = await api.get('/analytics/attendance');
  return data;
};

export const getProductivityAnalytics = async (): Promise<ProductivityStats> => {
  const { data } = await api.get('/analytics/productivity');
  return data;
};

export const getProjectPerformance = async (): Promise<ProjectPerformance[]> => {
  const { data } = await api.get('/analytics/projects');
  return data;
};

export const getInsights = async (): Promise<InsightPattern[]> => {
  const { data } = await api.get('/analytics/insights');
  return data;
};
