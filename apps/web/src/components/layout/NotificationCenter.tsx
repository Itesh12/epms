'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyNotifications, markAsRead, markAllAsRead } from '@/services/notifications';
import { Bell, Check, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Notification } from '@epms/shared';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getMyNotifications,
    refetchInterval: 30000 // Fallback if socket fails
  });

  const markMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                   <button 
                    onClick={() => markAllMutation.mutate()}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                   >
                     <Check size={14}/> Mark all as read
                   </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n: Notification) => (
                    <div 
                      key={n.id || (n as any)._id}
                      onClick={() => !n.isRead && markMutation.mutate(n.id || (n as any)._id)}
                      className={`p-4 border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors relative ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                    >
                      {!n.isRead && <span className="absolute left-2 top-6 w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                      <div className="ml-2">
                        <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                          <Clock size={10} /> {format(new Date(n.createdAt!), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                     <p className="text-sm">No notifications found.</p>
                  </div>
                )}
              </div>

              <div className="p-3 border-t bg-gray-50 text-center">
                 <button className="text-xs font-bold text-gray-500 hover:text-gray-700">View All Activity</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
