'use client';

import { 
  Calendar, 
  MessageSquare, 
  CheckSquare, 
  Clock, 
  AlertCircle,
  MoreVertical,
  User as UserIcon,
  GitBranch,
  CheckCircle2
} from 'lucide-react';
import { TaskPriority, TaskStatus } from '@/types/task';
import { cn } from '@/lib/utils';

const priorityColors = {
  LOW: 'text-blue-500 bg-blue-500/10',
  MEDIUM: 'text-amber-500 bg-amber-500/10',
  HIGH: 'text-orange-500 bg-orange-500/10',
  URGENT: 'text-red-500 bg-red-500/10',
};

interface TaskCardProps {
  task: any;
  onClick?: () => void;
  allTasks?: any[]; // Pass all tasks to compute subtask count
}

export function TaskCard({ task, onClick, allTasks = [] }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const taskSubtasks = allTasks.filter((t: any) => t.parentId === task._id);
  const subtaskCount = taskSubtasks.length;
  const doneSubtasks = taskSubtasks.filter((t: any) => t.status === 'DONE').length;
  const hasSubtasks = subtaskCount > 0;

  const totalEst = (task.estimatedHours || 0) + taskSubtasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
  const totalAct = (task.actualHours || 0) + taskSubtasks.reduce((s, t) => s + (t.actualHours || 0), 0);

  return (
    <div 
      onClick={onClick}
      className={cn(
        "astra-card astra-glass p-6 rounded-3xl transition-all duration-300 cursor-grab active:cursor-grabbing group border border-white/5 hover:border-primary/40 relative overflow-hidden",
        isOverdue && "border-red-500/30 bg-red-500/[0.02]"
      )}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className={cn(
          "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border",
          priorityColors[task.priority as keyof typeof priorityColors] || 'bg-muted/30 text-muted-foreground/60 border-border/50'
        )}>
          {task.priority}
        </div>
        <button className="text-muted-foreground/30 hover:text-foreground transition-all p-1.5 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 opacity-0 group-hover:opacity-100">
          <MoreVertical size={14} strokeWidth={2.5} />
        </button>
      </div>

      <div className="space-y-2 mb-4 relative z-10">
        <div className="flex items-start gap-2">
          {hasSubtasks && (
            <span className="mt-0.5 flex-shrink-0 w-4 h-4 text-primary/60">
              <GitBranch size={14} />
            </span>
          )}
          <h4 className="font-black text-foreground tracking-tight group-hover:text-primary transition-colors leading-snug">
            {task.title}
          </h4>
        </div>
        {task.description && (
          <p className="text-muted-foreground/60 text-[11px] font-bold tracking-wide line-clamp-2 pl-6">
            {task.description}
          </p>
        )}
      </div>

      {/* Subtask progress bar */}
      {hasSubtasks && (
        <div className="mb-4 relative z-10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">
              <GitBranch size={10} />
              <span>{doneSubtasks}/{subtaskCount} subtasks</span>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/40">{subtaskCount > 0 ? Math.round((doneSubtasks/subtaskCount)*100) : 0}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${subtaskCount > 0 ? (doneSubtasks/subtaskCount)*100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-5 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
              isOverdue ? "text-red-500" : "text-muted-foreground/40"
            )}>
              <Calendar size={12} strokeWidth={2.5} />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
          {totalEst > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-black text-white/50 uppercase tracking-widest">
              <Clock size={12} strokeWidth={2.5} />
              {totalEst}H Est
            </div>
          )}
          {totalAct > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-400/50 uppercase tracking-widest">
              <CheckCircle2 size={12} strokeWidth={2.5} />
              {totalAct}H Act
            </div>
          )}
        </div>

        <div className="flex items-center">
           <div className="w-8 h-8 rounded-xl bg-muted/40 border border-white/5 flex items-center justify-center text-[10px] font-black text-foreground shadow-lg shadow-black/10 group-hover:scale-110 transition-transform" title={task.assigneeId?.email}>
             {task.assigneeId?.email?.[0].toUpperCase() || <UserIcon size={12} />}
           </div>
        </div>
      </div>
    </div>
  );
}
