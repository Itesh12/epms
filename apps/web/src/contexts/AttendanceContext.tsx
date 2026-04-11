'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Attendance } from '@epms/shared';
import { toast } from 'sonner';

export interface DashboardMetrics {
  workHours: string;
  attendance: string;
  efficiency: string;
  perfScore: string;
  tasksDone: number;
}

export interface EmployeeProfile {
  _id: string;
  name: string;
  email: string;
  jobTitle?: string;
  department?: string;
  employeeId?: string;
  joinedAt?: string;
  avatar?: string;
  status: string;
  skills: string[];
}

interface AttendanceContextType {
  attendance: Attendance | null;
  isLoading: boolean;
  metrics: DashboardMetrics | null;
  metricsLoading: boolean;
  profile: EmployeeProfile | null;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  toggleBreak: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  getReports: (startDate: string, endDate: string) => Promise<any>;
  getHeatmapData: (year: string) => Promise<any>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const { user, token } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/attendance/status');
      setAttendance(data);
    } catch (error) {
      console.error('Failed to fetch attendance status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshMetrics = useCallback(async () => {
    if (!user) return;
    try {
      setMetricsLoading(true);
      const { data } = await api.get('/attendance/dashboard-metrics');
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  }, [user]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/employees/me');
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user && token) {
      refreshStatus();
      refreshMetrics();
      fetchProfile();

      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
        auth: { token },
        withCredentials: true
      });

      newSocket.on('connect', () => {
        if (user.organizationId) {
          newSocket.emit('join-org', user.organizationId);
        }
      });

      newSocket.on('attendance:update', (updatedAttendance: Attendance) => {
        if (updatedAttendance.userId === user.id) {
          setAttendance(updatedAttendance);
          // Refresh metrics whenever attendance changes
          refreshMetrics();
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, token, refreshStatus, refreshMetrics, fetchProfile]);

  const checkIn = async () => {
    try {
      const { data } = await api.post('/attendance/check-in');
      setAttendance(data);
      await refreshMetrics();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Check-in failed';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const checkOut = async () => {
    try {
      const { data } = await api.post('/attendance/check-out');
      setAttendance(data);
      await refreshMetrics();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Check-out failed';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const toggleBreak = async () => {
    try {
      const { data } = await api.post('/attendance/toggle-break');
      setAttendance(data);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Toggle break failed';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const getReports = async (startDate: string, endDate: string) => {
    try {
      const { data } = await api.get('/attendance/reports', {
        params: { startDate, endDate }
      });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports');
    }
  };

  const getHeatmapData = async (year: string) => {
    try {
      const { data } = await api.get('/attendance/heatmap', {
        params: { year }
      });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch heatmap data');
    }
  };

  return (
    <AttendanceContext.Provider value={{ 
      attendance, 
      isLoading, 
      metrics,
      metricsLoading,
      profile,
      checkIn, 
      checkOut, 
      toggleBreak,
      refreshStatus,
      refreshMetrics,
      getReports,
      getHeatmapData
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
