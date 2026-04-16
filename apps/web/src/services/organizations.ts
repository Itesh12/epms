import api from './api';

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  adminId: string;
  createdAt: string;
}

export const getMyOrganizations = async (): Promise<Organization[]> => {
  const { data } = await api.get('/organizations/my');
  return data;
};

export const createOrganization = async (name: string) => {
  const { data } = await api.post('/organizations', { name });
  return data;
};

export const switchOrganization = async (orgId: string) => {
  const { data } = await api.post(`/auth/switch-org/${orgId}`);
  return data;
};
