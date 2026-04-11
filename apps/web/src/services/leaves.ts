import api from './api';
import { Leave } from '@epms/shared';

export const requestLeave = async (leave: Partial<Leave>): Promise<Leave> => {
  const { data } = await api.post('/leaves', leave);
  return data;
};

export const getMyLeaves = async (): Promise<Leave[]> => {
  const { data } = await api.get('/leaves');
  return data;
};
