'use client';

import React, { useState } from 'react';
import { Task, TaskStatus } from '@epms/shared';
import TaskCard from './TaskCard';
import { updateTask } from '@/services/tasks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; label: string; bg: string; dot: string }[] = [
  { id: 'TODO', label: 'To Do', bg: 'bg-gray-100', dot: 'bg-gray-400' },
  { id: 'IN_PROGRESS', label: 'In Progress', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  { id: 'DONE', label: 'Done', bg: 'bg-green-50', dot: 'bg-green-500' },
];

export default function KanbanBoard({ tasks, projectId, onTaskClick, onAddTask }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) => updateTask(taskId, { status }),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const prevTasks = queryClient.getQueryData<Task[]>(['tasks', projectId]);
      if (prevTasks) {
        queryClient.setQueryData<Task[]>(['tasks', projectId], prevTasks.map(t => 
          (t.id || (t as any)._id) === taskId ? { ...t, status } : t
        ));
      }
      return { prevTasks };
    },
    onError: (err, variables, context) => {
      if (context?.prevTasks) {
        queryClient.setQueryData(['tasks', projectId], context.prevTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    }
  });

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to keep the card visible while dragging but change its styling if needed
    setTimeout(() => {
      // optional styling adjustments
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) setDragOverColumn(status);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedTask) return;
    
    if (draggedTask.status !== status) {
      updateStatusMutation.mutate({ taskId: draggedTask.id || (draggedTask as any)._id!, status });
    }
    setDraggedTask(null);
  };

  return (
    <div className="flex gap-6 h-full min-h-[500px] overflow-x-auto pb-4 custom-scrollbar">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const isOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex-shrink-0 w-[320px] flex flex-col rounded-2xl transition-colors duration-200 border-2 
              ${col.bg} 
              ${isOver ? 'border-blue-400 bg-blue-50/50' : 'border-transparent'}
            `}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <h3 className="font-semibold text-gray-700 text-sm tracking-wide uppercase">{col.label}</h3>
                <span className="ml-2 text-xs font-semibold bg-white/50 text-gray-500 py-0.5 px-2 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onAddTask(col.id); }}
                className="w-6 h-6 rounded-md hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {colTasks.map((task) => (
                  <TaskCard 
                    key={task.id || (task as any)._id} 
                    task={task} 
                    onDragStart={handleDragStart}
                    onClick={onTaskClick}
                  />
                ))}
              </AnimatePresence>
            </div>
            
            {/* Quick Add Button */}
            <div className="px-3 pb-3">
              <button 
                onClick={() => onAddTask(col.id)}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300/50 text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 hover:border-gray-300 font-medium text-sm transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
