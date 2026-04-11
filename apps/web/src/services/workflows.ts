import api from './api';
import { ApprovalFlow, ApprovalRequest } from '@epms/shared';

export const createFlow = async (flow: Partial<ApprovalFlow>): Promise<ApprovalFlow> => {
  const { data } = await api.post('/workflows/flows', flow);
  return data;
};

export const getFlows = async (): Promise<ApprovalFlow[]> => {
  const { data } = await api.get('/workflows/flows');
  return data;
};

export const getPendingApprovals = async (): Promise<ApprovalRequest[]> => {
  const { data } = await api.get('/workflows/pending');
  return data;
};

export const actionApproval = async (id: string, action: 'APPROVE' | 'REJECT', comment?: string): Promise<ApprovalRequest> => {
  const { data } = await api.post(`/workflows/action/${id}`, { action, comment });
  return data;
};
