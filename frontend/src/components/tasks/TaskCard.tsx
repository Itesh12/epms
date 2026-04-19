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
        "bg-white/[0.02] p-3 sm:p-4 rounded-xl transition-all duration-200 cursor-grab active:cursor-grabbing group border border-white/5 hover:border-primary/40 relative",
        isOverdue && "border-red-500/30 bg-red-500/[0.02]"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-bold text-sm text-foreground leading-tight group-hover:text-primary transition-colors">
          {task.title}
        </h4>
        <div className={cn(
          "flex-shrink-0 w-2 h-2 rounded-full mt-1",
          task.priority === 'URGENT' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
          task.priority === 'HIGH' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' :
          task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
        )} title={`${task.priority} Priority`} />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 pt-3 border-t border-white/5">
        <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-black text-white/70" title={task.assigneeId?.email || 'Unassigned'}>
          {task.assigneeId?.email?.[0].toUpperCase() || <UserIcon size={10} />}
        </div>

        {hasSubtasks && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60 bg-white/5 px-1.5 py-0.5 rounded-md">
            <GitBranch size={10} />
            {doneSubtasks}/{subtaskCount}
          </div>
        )}

        {task.dueDate && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-bold",
            isOverdue ? "text-red-400" : "text-muted-foreground/40"
          )}>
            <Calendar size={10} />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}

        {(totalEst > 0 || totalAct > 0) && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/40 ml-auto">
             <Clock size={10} />
             {totalAct}h / {totalEst}h
          </div>
        )}
      </div>
    </div>
  );
}
