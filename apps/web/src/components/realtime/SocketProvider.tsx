'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket, disconnectSocket } from '@/services/socket';
import { useAuthStore } from '@/store/authStore';
import { Notification, UserPresence } from '@epms/shared';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface SocketContextType {
  onlineUsers: string[];
  notifications: Notification[];
}

const SocketContext = createContext<SocketContextType>({
  onlineUsers: [],
  notifications: []
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuthStore();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (token && user) {
      const socket = getSocket(token);

      socket.on('presence-update', (data: { userId: string, status: 'ONLINE' | 'OFFLINE' }) => {
        setOnlineUsers(prev => {
          if (data.status === 'ONLINE') {
            return prev.includes(data.userId) ? prev : [...prev, data.userId];
          } else {
            return prev.filter(id => id !== data.userId);
          }
        });
      });

      socket.on('notification-received', (notification: Notification) => {
        toast(notification.title, {
          description: notification.message,
          action: notification.targetUrl ? {
            label: 'View',
            onClick: () => window.location.href = notification.targetUrl!
          } : undefined
        });
        // Invalidate notifications query
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      // Special events for specific modules
      socket.on('task-created', () => queryClient.invalidateQueries({ queryKey: ['tasks', 'projectTasks'] }));
      socket.on('task-updated', () => queryClient.invalidateQueries({ queryKey: ['tasks', 'projectTasks'] }));

      return () => {
        disconnectSocket();
      };
    }
  }, [token, user, queryClient]);

  return (
    <SocketContext.Provider value={{ onlineUsers, notifications: [] }}>
      {children}
    </SocketContext.Provider>
  );
};
