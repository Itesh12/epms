'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectById } from '@/services/projects';
import { getTasksByProject, createTask, updateTask, addComment } from '@/services/tasks';
import { Project, Task, TaskStatus, TaskPriority } from '@epms/shared';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import KanbanBoard from '@/components/projects/KanbanBoard';
import { Activity, Clock, CheckCircle2, ChevronLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function ProjectDashboard({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('Projects');
  const taskT = useTranslations('Tasks');
  const attendanceT = useTranslations('Attendance');
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { id } = React.use(params);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Modals state
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('TODO');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => getTasksByProject(id),
  });

  // Socket Setup for Real-time
  useEffect(() => {
    if (!user?.organizationId) return;
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    
    newSocket.on('connect', () => {
      newSocket.emit('join-org', user.organizationId);
    });

    newSocket.on(`project:${id}:task-created`, (task: Task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    });

    newSocket.on(`project:${id}:task-updated`, (task: Task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    });

    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, [id, user?.organizationId, queryClient]);

  const createTaskMutation = useMutation({
    mutationFn: (data: Partial<Task>) => createTask({ ...data, projectId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      setTaskModalOpen(false);
    }
  });

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createTaskMutation.mutate({
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      priority: formData.get('priority') as TaskPriority,
      status: newTaskStatus,
      // If we had users list we could pick assignee, ignoring for now
    });
  };

  // Metrics calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const totalTimeSpentSeconds = tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
  const totalHours = Math.floor(totalTimeSpentSeconds / 3600);
  const totalMins = Math.floor((totalTimeSpentSeconds % 3600) / 60);

  if (!project) return <div className="p-8 animate-pulse text-gray-500">{t('loading')}</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      {/* Header & Metrics */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-shrink-0">
        <Link href="/projects" className="text-gray-400 hover:text-blue-600 inline-flex items-center gap-1 mb-4 text-sm font-medium transition-colors">
          <ChevronLeft size={16} /> {t('back')}
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{project.name}</h1>
            <p className="text-gray-500 mt-1 max-w-2xl">{project.description}</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">{attendanceT('totalWork')}</p>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${progress}%` }} 
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                  <span className="font-bold text-blue-700">{progress}%</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 flex items-center gap-4 min-w-[200px]">
               <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-900 mb-1">{t('timeLogged')}</p>
                <p className="font-bold text-purple-700">{totalHours}h {totalMins}m</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden flex flex-col min-h-0">
        <KanbanBoard 
          tasks={tasks} 
          projectId={id} 
          onAddTask={(status) => { setNewTaskStatus(status); setTaskModalOpen(true); }}
          onTaskClick={(task) => setSelectedTask(task)}
        />
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-6">{taskT('addTitle', { status: newTaskStatus.replace('_', ' ') })}</h2>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{taskT('titleLabel')}</label>
                  <input name="title" required className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{taskT('descLabel')}</label>
                  <textarea name="description" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 h-24 resize-none text-gray-900 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{taskT('priorityLabel')}</label>
                  <select name="priority" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 outline-none">
                    <option value="LOW">{taskT('priorities.low')}</option>
                    <option value="MEDIUM">{taskT('priorities.medium')}</option>
                    <option value="HIGH">{taskT('priorities.high')}</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3 justify-end">
                  <button type="button" onClick={() => setTaskModalOpen(false)} className="px-5 py-2 hover:bg-gray-100 rounded-xl font-medium">{t('cancel')}</button>
                  <button type="submit" disabled={createTaskMutation.isPending} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">{taskT('createButton')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Details Modal (Simplified for now) */}
      <AnimatePresence>
        {selectedTask && (
           <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-end z-50" onClick={() => setSelectedTask(null)}>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="bg-white h-full w-full max-w-md shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold">{taskT('detailsTitle')}</h2>
                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedTask.title}</h3>
                <div className="flex gap-2 mb-6">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full">{selectedTask.status}</span>
                  <span className="px-3 py-1 bg-yellow-50 text-yellow-700 font-bold text-xs rounded-full">{selectedTask.priority}</span>
                </div>
                <div className="prose text-gray-600 text-sm mb-8">
                  {selectedTask.description || taskT('noDescription')}
                </div>
                
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2"><Activity size={18}/> {taskT('activityTitle')} </h4>
                <div className="space-y-4">
                  {selectedTask.comments?.map((comment: any, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-xl text-sm">
                      <p className="text-gray-800">{comment.text}</p>
                      <p className="text-xs text-gray-400 mt-2">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</p>
                    </div>
                  ))}
                  <form onSubmit={e => {
                    e.preventDefault();
                    const input = (e.target as any).comment.value;
                    if(input) {
                      addComment(selectedTask.id || (selectedTask as any)._id, input).then(() => {
                         queryClient.invalidateQueries({ queryKey: ['tasks', id] });
                         (e.target as HTMLFormElement).reset();
                         // Update local view optimistically simply by closing or letting queryClient refresh and the user clicks again.
                         // Actually the sockets will refresh it!
                      });
                    }
                  }}>
                    <input name="comment" placeholder={taskT('commentPlaceholder')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 outline-none" />
                  </form>
                </div>
              </div>
            </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
