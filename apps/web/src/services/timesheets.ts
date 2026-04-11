import api from './api';
import { Timesheet, TimesheetEntry } from '@epms/shared';

export const getTimesheet = async (date?: string): Promise<Timesheet> => {
  const { data } = await api.get('/timesheets', { params: { date } });
  return data;
};

export const saveTimesheetEntries = async (id: string, entries: TimesheetEntry[]): Promise<Timesheet> => {
  const { data } = await api.patch(`/timesheets/${id}/entries`, { entries });
  return data;
};

export const submitTimesheet = async (id: string): Promise<Timesheet> => {
  const { data } = await api.post(`/timesheets/${id}/submit`);
  return data;
};
