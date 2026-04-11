import api from './api';
import { Notification } from '@epms/shared';

export const getMyNotifications = async (): Promise<Notification[]> => {
  const { data } = await api.get('/notifications');
  return data;
};

export const markAsRead = async (id: string): Promise<void> => {
  await api.patch(`/notifications/read/${id}`);
};

export const markAllAsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};
