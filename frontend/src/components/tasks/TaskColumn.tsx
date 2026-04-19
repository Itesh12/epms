'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from './SortableTaskCard';
import { Task, TaskStatus } from '@/types/task';
import { ListTodo, Clock, CheckCircle2, Inbox, Eye, Beaker } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  allTasks?: Task[];
  onTaskClick?: (task: Task) => void;
}

const columnConfig = {
  [TaskStatus.BACKLOG]:     { icon: Inbox,        color: 'text-zinc-400',    bg: 'bg-zinc-500/10',    border: 'border-zinc-500/20',    dot: 'bg-zinc-400' },
  [TaskStatus.TODO]:        { icon: ListTodo,     color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   dot: 'bg-slate-400' },
  [TaskStatus.IN_PROGRESS]: { icon: Clock,        color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    dot: 'bg-blue-400 animate-pulse' },
  [TaskStatus.IN_REVIEW]:   { icon: Eye,          color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  dot: 'bg-purple-400' },
  [TaskStatus.TESTING]:     { icon: Beaker,       color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400' },
  [TaskStatus.DONE]:        { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
};

export function TaskColumn({ id, title, tasks, allTasks = [], onTaskClick }: TaskColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  const config = columnConfig[id];
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-3 w-full h-full min-w-[260px]">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className={cn('p-1.5 rounded-lg border', config.bg, config.border)}>
            <Icon size={14} className={config.color} strokeWidth={2.5} />
          </div>
          <h3 className="font-black text-[10px] uppercase tracking-widest text-white/60">{title}</h3>
        </div>
        <div className={cn(
          'flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest',
          config.bg, config.border, config.color
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
          {tasks.length}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className="bg-white/[0.03] border border-white/5 rounded-2xl p-2 min-h-[560px] flex flex-col gap-2 relative transition-colors"
      >
        <SortableContext
          id={id}
          items={tasks.map(t => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task._id}
              task={task}
              onClick={() => onTaskClick?.(task)}
              allTasks={allTasks}
            />
          ))}

          {tasks.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-xl text-center gap-3 opacity-30 m-2">
              <Icon size={22} className={config.color} />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No tasks here</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
