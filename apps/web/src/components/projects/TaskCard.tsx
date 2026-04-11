'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@epms/shared';
import { Play, Square, MessageSquare, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { addTime } from '@/services/tasks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onClick: (task: Task) => void;
}

export default function TaskCard({ task, onDragStart, onClick }: TaskCardProps) {
  const t = useTranslations('Tasks');
  const queryClient = useQueryClient();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(task.timeSpent || 0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const timeMutation = useMutation({
    mutationFn: ({ id, timeAdded }: { id: string, timeAdded: number }) => addTime(id, timeAdded),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', task.projectId] });
    }
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime((task.timeSpent || 0) + Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, startTime, task.timeSpent]);

  const toggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTimerRunning) {
      // stop
      setIsTimerRunning(false);
      const timeAdded = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
      timeMutation.mutate({ id: task.id || (task as any)._id, timeAdded });
      setStartTime(null);
    } else {
      // start
      setIsTimerRunning(true);
      setStartTime(Date.now());
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}${t('timeUnits.h')} ${m}${t('timeUnits.m')}`;
    if (m > 0) return `${m}${t('timeUnits.m')}`;
    return `${s}${t('timeUnits.s')}`;
  };

  return (
    <motion.div
      layout
      draggable
      onDragStart={(e: any) => onDragStart(e, task)}
      onClick={() => onClick(task)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, zIndex: 10 }}
      className={`bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing mb-3 group relative overflow-hidden ${
        isTimerRunning ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h4 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">
          {task.title}
        </h4>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {task.priority === 'HIGH' && <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase tracking-wider">{t('labels.highPriority')}</span>}
        {task.priority === 'MEDIUM' && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded uppercase tracking-wider">{t('labels.mediumPriority')}</span>}
        {task.priority === 'LOW' && <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase tracking-wider">{t('labels.lowPriority')}</span>}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
        <div className="flex items-center gap-2">
          {task.assigneeId ? (
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]" title={(task.assigneeId as any).name}>
              {(task.assigneeId as any).name?.[0]?.toUpperCase()}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-100 border border-dashed border-gray-300" />
          )}
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1 text-gray-400">
              <MessageSquare size={12} /> {task.comments.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono tracking-tight font-medium text-gray-600">
            {isTimerRunning && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            {formatTime(elapsedTime)}
          </span>
          <button
            onClick={toggleTimer}
            className={`p-1.5 rounded-md transition-colors ${
              isTimerRunning ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            {isTimerRunning ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
