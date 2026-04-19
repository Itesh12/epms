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
        "bg-card hover:bg-muted/30 p-2.5 rounded-xl transition-all duration-200 cursor-grab active:cursor-grabbing group border border-divider hover:border-primary/40 relative flex flex-col gap-2 shadow-sm",
        isOverdue && "border-red-500/30 bg-red-500/[0.02]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-xs text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {task.title}
        </h4>
        <div className={cn(
          "flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1",
          task.priority === 'URGENT' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
          task.priority === 'HIGH' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' :
          task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
        )} title={`${task.priority} Priority`} />
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 pt-2 border-t border-divider">
        <div className="w-4.5 h-4.5 rounded-lg bg-primary/20 flex items-center justify-center text-[8px] font-black text-white" title={task.assigneeId?.email || 'Unassigned'}>
          {task.assigneeId?.email?.[0].toUpperCase() || <UserIcon size={9} />}
        </div>

        {hasSubtasks && (
          <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md border border-divider">
            <GitBranch size={9} />
            {doneSubtasks}/{subtaskCount}
          </div>
        )}

        {task.dueDate && (
          <div className={cn(
            "flex items-center gap-1 text-[9px] font-black",
            isOverdue ? "text-red-500" : "text-muted-foreground/60"
          )}>
            <Calendar size={9} />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}

        {(totalEst > 0 || totalAct > 0) && (
          <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground/60 ml-auto tabular-nums">
             <Clock size={9} />
             {totalAct}h / {totalEst}h
          </div>
        )}
      </div>
    </div>
  );
}
