'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { getSocket, disconnectSocket } from '@/services/socket';
import { useAuthStore } from '@/store/authStore';
import { Notification } from '@epms/shared';
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
  const hydratedRef = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Mark as hydrated on first render
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      console.log("📡 SocketProvider: Hydrated from store");
    }
  }, []);

  useEffect(() => {
    // Wait for hydration and check token availability
    if (!hydratedRef.current || !token || !user) {
      console.log("📡 SocketProvider: Waiting for hydration or auth", {
        isHydrated: hydratedRef.current,
        hasToken: !!token,
        hasUser: !!user
      });
      return;
    }

    console.log("📡 SocketProvider: Attempting socket connection", {
      userId: user.id,
      tokenLength: token.length
    });

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
  }, [token, user, queryClient]);

  return (
    <SocketContext.Provider value={{ onlineUsers, notifications: [] }}>
      {children}
    </SocketContext.Provider>
  );
};
