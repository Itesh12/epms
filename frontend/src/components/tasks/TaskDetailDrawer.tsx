'use client';

import { useState, useEffect } from 'react';
import { 
  X, Loader2, AlignLeft,
  CheckCircle2, Clock, Plus, CircleDot, Activity, ArrowLeft, ChevronRight,
  Calendar, User, Inbox, Eye, Beaker
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { cn } from '@/lib/utils';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  projectMembers: any[];
}

export function TaskDetailDrawer({ task: initialTask, isOpen, onClose, onUpdate, projectMembers }: TaskDetailDrawerProps) {
  const [task, setTask] = useState<Task | null>(initialTask);
  const [taskHistory, setTaskHistory] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);
  const [updatingSubtask, setUpdatingSubtask] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Local state for editable fields to prevent constant re-renders during typing
  const [localTitle, setLocalTitle] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [localEstimate, setLocalEstimate] = useState<string>('');
  const [localActual, setLocalActual] = useState<string>('');

  const getAssigneeId = (t: Task | null) => {
    if (!t || !t.assigneeId) return '';
    if (typeof t.assigneeId === 'string') return t.assigneeId;
    if (typeof t.assigneeId === 'object') return (t.assigneeId as any)._id || '';
    return '';
  };

  useEffect(() => {
    setTask(initialTask);
    setTaskHistory([]);
  }, [initialTask, isOpen]);

  useEffect(() => {
    if (task && isOpen) {
      setLocalTitle(task.title || '');
      setLocalDescription(task.description || '');
      setLocalEstimate(task.estimatedHours ? String(task.estimatedHours) : '');
      setLocalActual(task.actualHours ? String(task.actualHours) : '');
      fetchSubtasks(task._id);
    }
  }, [task?._id, isOpen]);

  const fetchSubtasks = async (id: string) => {
    setIsLoadingSubtasks(true);
    try {
      const allTasks = await api.get(`/tasks?projectId=${task?.projectId}`);
      setSubtasks(allTasks.data.filter((t: any) => t.parentId === id));
    } catch (error) {
      console.error('Failed to fetch subtasks', error);
    } finally {
      setIsLoadingSubtasks(false);
    }
  };

  const handleUpdate = async (field: keyof Task, value: any) => {
    if (!task) return;
    if (task[field] === value) return; // No change
    
    // Optimistic
    const prevTask = { ...task };
    setTask({ ...task, [field]: value } as Task);

    try {
      const res = await api.patch(`/tasks/${task._id}`, { [field]: value });
      setTask(res.data);
      if (field === 'estimatedHours' || field === 'actualHours') {
        onUpdate(); // Need to trigger parent re-render to calculate rollup globally
      } else {
        onUpdate(); // Trigger parent anyways to refresh board titles/etc
      }
    } catch (error) {
      setTask(prevTask); // Rollback
      toast.error('Failed to update task');
    }
  };

  const handleUpdateStatus = async (status: TaskStatus) => {
    if (!task) return;
    setIsUpdating(true);
    try {
      const res = await api.patch(`/tasks/${task._id}`, { status });
      setTask(res.data);
      onUpdate();
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task) return;

    try {
      await api.post('/tasks', {
        title: newSubtaskTitle,
        projectId: task.projectId,
        parentId: task._id,
        assigneeId: getAssigneeId(task), 
        priority: task.priority,
      });
      setNewSubtaskTitle('');
      fetchSubtasks(task._id);
      onUpdate();
      toast.success('Subtask added');
    } catch (error) {
      toast.error('Failed to add subtask');
    }
  };

  const handleSubtaskStatusChange = async (subtaskId: string, newStatus: TaskStatus) => {
    setUpdatingSubtask(subtaskId);
    try {
      await api.patch(`/tasks/${subtaskId}`, { status: newStatus });
      setSubtasks(prev =>
        prev.map(s => s._id === subtaskId ? { ...s, status: newStatus } : s)
      );
      onUpdate();
    } catch {
      toast.error('Failed to update subtask');
    } finally {
      setUpdatingSubtask(null);
    }
  };

  if (!task) return null;

  const totalSubtaskEstimate = subtasks.reduce((sum, s) => sum + (s.estimatedHours || 0), 0);
  const totalSubtaskActual = subtasks.reduce((sum, s) => sum + (s.actualHours || 0), 0);

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div className={cn(
        "fixed inset-y-0 right-0 z-[80] w-full max-w-[650px] bg-background border-l border-white/10 shadow-2xl transition-transform duration-500 transform",
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] opacity-40 pointer-events-none" />

        <div className="relative h-full flex flex-col z-10">
          <div className="p-8 sm:p-10 border-b border-white/5 flex justify-between items-start">
            <div className="space-y-4 flex-1 pr-6">
              {taskHistory.length > 0 && (
                <button 
                  onClick={() => {
                    const prev = taskHistory[taskHistory.length - 1];
                    setTask(prev);
                    setTaskHistory(taskHistory.slice(0, -1));
                  }}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-white transition-colors mb-2"
                >
                  <ArrowLeft size={12} /> Back to Parent Task
                </button>
              )}
              <div className="flex flex-wrap items-center gap-3">
                 <div className={cn(
                   "text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest",
                   task.status === 'DONE' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 
                   task.status === 'IN_PROGRESS' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 
                   'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                 )}>
                   {task.status.replace('_', ' ')}
                 </div>
                 
                 {/* Priority Dropdown */}
                 <div className="relative group min-w-[170px]">
                   <CustomSelect 
                     value={task.priority}
                     onChange={(v) => handleUpdate('priority', v)}
                     options={[
                       { value: TaskPriority.LOW, label: 'LOW', color: 'text-slate-400' },
                       { value: TaskPriority.MEDIUM, label: 'NORMAL', color: 'text-blue-400' },
                       { value: TaskPriority.HIGH, label: 'HIGH', color: 'text-orange-400' },
                       { value: TaskPriority.URGENT, label: 'URGENT', color: 'text-red-400' },
                     ]}
                     className={cn(
                       "rounded-full py-1.5 px-4 bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest",
                       task.priority === 'URGENT' ? 'bg-red-400/10 border-red-400/30' :
                       task.priority === 'HIGH' ? 'bg-orange-400/10 border-orange-400/30' :
                       task.priority === 'MEDIUM' ? 'bg-blue-400/10 border-blue-400/30' :
                       ''
                     )}
                     dropdownClassName="text-[10px] uppercase tracking-widest w-48 shadow-xl shadow-black/50"
                   />
                 </div>
              </div>
              
              {/* Editable Title */}
              <input
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={(e) => handleUpdate('title', e.target.value)}
                className="w-full text-3xl font-black text-white tracking-tight leading-snug bg-transparent border-none outline-none focus:ring-0 placeholder:text-white/20 p-0"
                placeholder="Task Title..."
              />
            </div>
            <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all text-muted-foreground hover:text-white border border-white/5">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-10 scrollbar-none">
            
            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <User size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Assignee</span>
                  <CustomSelect 
                    value={getAssigneeId(task)}
                    onChange={(v) => handleUpdate('assigneeId', v)}
                    options={[
                      { value: '', label: 'Unassigned', color: 'text-muted-foreground' },
                      ...projectMembers.map(m => ({ value: m._id, label: m.email }))
                    ]}
                    className="bg-transparent border-none p-0 hover:bg-transparent focus:ring-0 text-white"
                    dropdownClassName="w-64 -right-4"
                  />
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Calendar size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Due Date</span>
                  <input 
                    type="date"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleUpdate('dueDate', e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-white outline-none cursor-pointer p-0 border-none focus:ring-0 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
               <h4 className="flex items-center gap-3 text-xs font-black text-white uppercase tracking-widest">
                 <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                   <AlignLeft size={14} strokeWidth={2.5} />
                 </div>
                 Description
               </h4>
               <textarea
                 value={localDescription}
                 onChange={(e) => setLocalDescription(e.target.value)}
                 onBlur={(e) => handleUpdate('description', e.target.value)}
                 className="w-full min-h-[100px] text-muted-foreground/80 font-medium text-sm leading-relaxed bg-white/[0.02] p-5 rounded-2xl border border-white/5 outline-none focus:border-primary/50 transition-colors resize-none placeholder:italic placeholder:opacity-50"
                 placeholder="Add a detailed description here..."
               />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 relative group transition-all focus-within:border-primary/50">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Activity size={40} />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">My Estimate</span>
                  <div className="flex items-end gap-2">
                     <input
                       type="number"
                       value={localEstimate}
                       onChange={(e) => setLocalEstimate(e.target.value)}
                       onBlur={(e) => handleUpdate('estimatedHours', Number(e.target.value) || 0)}
                       className="w-16 text-3xl font-black text-white bg-transparent border-none p-0 focus:ring-0"
                       min="0"
                     />
                     <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest pb-1.5">Hours</span>
                  </div>
                  {totalSubtaskEstimate > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5 text-[11px] font-bold text-primary/80">
                      + {totalSubtaskEstimate}h from subtasks<br/>
                      <span className="text-white">= {(task.estimatedHours || 0) + totalSubtaskEstimate}h Total Target</span>
                    </div>
                  )}
               </div>
               <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 relative group transition-all focus-within:border-primary/50">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Clock size={40} />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">My Actual</span>
                  <div className="flex items-end gap-2">
                     <input
                       type="number"
                       value={localActual}
                       onChange={(e) => setLocalActual(e.target.value)}
                       onBlur={(e) => handleUpdate('actualHours', Number(e.target.value) || 0)}
                       className="w-16 text-3xl font-black text-white bg-transparent border-none p-0 focus:ring-0"
                       min="0"
                     />
                     <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest pb-1.5">Hours</span>
                  </div>
                  {totalSubtaskActual > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5 text-[11px] font-bold text-blue-400/80">
                      + {totalSubtaskActual}h from subtasks<br/>
                      <span className="text-white">= {(task.actualHours || 0) + totalSubtaskActual}h Total Logged</span>
                    </div>
                  )}
               </div>
            </div>

            {/* Subtasks */}
            <div className="space-y-5">
               <div className="flex items-center justify-between">
                 <h4 className="flex items-center gap-3 text-xs font-black text-white uppercase tracking-widest">
                   <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                     <CheckCircle2 size={14} strokeWidth={2.5} />
                   </div>
                   Subtasks
                 </h4>
                 <span className="text-xs font-bold text-muted-foreground/50">{subtasks.length} total</span>
               </div>
               
               <div className="space-y-2">
                   {subtasks.map(sub => {
                     const isUpdatingSub = updatingSubtask === sub._id;
                     return (
                       <div 
                         key={sub._id} 
                         onClick={() => {
                           setTaskHistory(prev => [...prev, task]);
                           setTask(sub);
                         }}
                         className={cn(
                           'flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] hover:border-primary/20 transition-all cursor-pointer group',
                           isUpdatingSub && 'opacity-50 pointer-events-none'
                         )}
                       >
                         <div className="flex items-center gap-4 flex-1 min-w-0">
                           {/* Click to cycle status */}
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               const next: Record<string, TaskStatus> = {
                                 TODO: TaskStatus.IN_PROGRESS,
                                 IN_PROGRESS: TaskStatus.DONE,
                                 DONE: TaskStatus.TODO,
                               };
                               handleSubtaskStatusChange(sub._id, next[sub.status] || TaskStatus.TODO);
                             }}
                             title={`Status: ${sub.status.replace('_', ' ')} — click to advance`}
                             className="flex-shrink-0 flex items-center justify-center w-6 h-6 transition-transform hover:scale-110 bg-background/50 rounded-full border border-white/5"
                           >
                             {isUpdatingSub ? (
                               <Loader2 size={12} className="animate-spin text-primary" />
                             ) : sub.status === 'BACKLOG' ? (
                               <Inbox size={12} className="text-zinc-400" />
                             ) : sub.status === 'DONE' ? (
                               <CheckCircle2 size={14} className="text-emerald-500" />
                             ) : sub.status === 'IN_PROGRESS' ? (
                               <Clock size={12} className="text-blue-400" />
                             ) : sub.status === 'IN_REVIEW' ? (
                               <Eye size={12} className="text-purple-400" />
                             ) : sub.status === 'TESTING' ? (
                               <Beaker size={12} className="text-amber-400" />
                             ) : (
                               <CircleDot size={12} className="text-slate-400/50 group-hover:text-primary/50" />
                             )}
                           </button>

                           <span className={cn(
                             'text-sm font-bold truncate transition-all flex items-center gap-2',
                             sub.status === 'DONE' ? 'line-through text-muted-foreground/30' : 'text-white/90 group-hover:text-primary'
                           )}>
                             {sub.title}
                           </span>
                         </div>

                         {/* Status dropdown */}
                         <div className="flex items-center gap-2">
                           {sub.estimatedHours ? (
                             <span className="text-[10px] font-bold text-muted-foreground/40 bg-white/5 px-2 py-1 rounded hidden sm:block">
                               {sub.estimatedHours}h
                             </span>
                           ) : null}
                           <CustomSelect
                             value={sub.status}
                             onChange={(v) => handleSubtaskStatusChange(sub._id, v as TaskStatus)}
                             options={[
                               { value: 'BACKLOG', label: 'Backlog', color: 'text-zinc-400' },
                               { value: 'TODO', label: 'To Do', color: 'text-slate-400' },
                               { value: 'IN_PROGRESS', label: 'In Progress', color: 'text-blue-400' },
                               { value: 'IN_REVIEW', label: 'In Review', color: 'text-purple-400' },
                               { value: 'TESTING', label: 'Testing', color: 'text-amber-400' },
                               { value: 'DONE', label: 'Done', color: 'text-emerald-400' },
                             ]}
                             className={cn(
                               "px-3 py-1.5 rounded-lg border outline-none text-[10px] uppercase tracking-widest flex-shrink-0 w-32",
                               sub.status === 'DONE' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
                               sub.status === 'IN_PROGRESS' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10' :
                               sub.status === 'TESTING' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' :
                               sub.status === 'IN_REVIEW' ? 'text-purple-400 border-purple-500/20 bg-purple-500/10' :
                               sub.status === 'BACKLOG' ? 'text-zinc-400 border-zinc-500/20 bg-zinc-500/10' :
                               'text-slate-400 border-white/10 bg-background/50'
                             )}
                           />
                           <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors ml-1" />
                         </div>
                       </div>
                     );
                   })}
                   
                  {isLoadingSubtasks && (
                    <div className="flex justify-center p-6">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                  {!isLoadingSubtasks && subtasks.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                       <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">No subtasks found</span>
                     </div>
                  )}
               </div>

               <form onSubmit={handleAddSubtask} className="flex gap-3 pt-2">
                  <input 
                    className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium text-white placeholder:text-muted-foreground/30"
                    placeholder="Add a new subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  />
                  <Button type="submit" disabled={!newSubtaskTitle.trim()} className="h-full px-5 rounded-2xl bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                     <Plus size={18} strokeWidth={2.5} />
                  </Button>
               </form>
            </div>
          </div>

          <div className="p-8 sm:p-10 border-t border-white/5 bg-background/80 backdrop-blur-xl flex gap-4 z-20">
             {task.status !== 'DONE' ? (
                <Button 
                  onClick={() => handleUpdateStatus(TaskStatus.DONE)} 
                  disabled={isUpdating}
                  className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white shadow-lg shadow-emerald-500/20 text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Task'}
                </Button>
             ) : (
                <Button 
                  onClick={() => handleUpdateStatus(TaskStatus.TODO)} 
                  disabled={isUpdating}
                  className="flex-1 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reopen Task'}
                </Button>
             )}
          </div>
        </div>
      </div>
    </>
  );
}
