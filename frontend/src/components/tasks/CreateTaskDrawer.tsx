'use client';

import { useState, useEffect } from 'react';
import {
  X, Loader2, Calendar, Plus,
  BarChart, Users, Type, AlignLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { TaskStatus, TaskPriority } from '@/types/task';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { cn } from '@/lib/utils';

interface CreateTaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
}

export function CreateTaskDrawer({ isOpen, onClose, onSuccess, projectId }: CreateTaskDrawerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);

  useEffect(() => {
    if (isOpen) {
      async function fetchEmployees() {
        setIsFetchingEmployees(true);
        try {
          const res = await api.get('/users');
          setEmployees(res.data);
        } catch (error) {
          console.error('Failed to fetch employees', error);
        } finally {
          setIsFetchingEmployees(false);
        }
      }
      fetchEmployees();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assigneeId) {
      toast.error('Title and Assignee are required');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/tasks', {
        title,
        description,
        projectId,
        assigneeId,
        priority,
        dueDate: dueDate || undefined,
        estimatedHours,
      });
      toast.success('Task created successfully!');
      onSuccess();
      onClose();
      // Reset
      setTitle('');
      setDescription('');
      setAssigneeId('');
      setPriority(TaskPriority.MEDIUM);
      setDueDate('');
      setEstimatedHours(0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[450px] bg-background border-l border-white/10 z-[101] shadow-2xl transition-transform duration-500 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Plus size={16} />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Create Task</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Add work to project workspace</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
            <form id="create-task-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Task Title</label>
                <Input
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/5 border-white/5 rounded-xl h-10 px-4 text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs focus:ring-1 focus:ring-primary/50 outline-none transition-all min-h-[120px] font-medium text-white placeholder:text-muted-foreground/30"
                  placeholder="Describe the scope of work..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Assign To</label>
                  <CustomSelect
                    value={assigneeId}
                    onChange={setAssigneeId}
                    options={[
                      { value: '', label: 'Assignee', color: 'text-muted-foreground' },
                      ...employees.map(emp => ({ value: emp._id, label: emp.email.split('@')[0] }))
                    ]}
                    className="bg-white/5 border-white/5 rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Priority</label>
                  <CustomSelect
                    value={priority}
                    onChange={(v) => setPriority(v as TaskPriority)}
                    options={[
                      { value: TaskPriority.LOW, label: 'LOW', color: 'text-slate-400' },
                      { value: TaskPriority.MEDIUM, label: 'NORMAL', color: 'text-blue-400' },
                      { value: TaskPriority.HIGH, label: 'HIGH', color: 'text-orange-400' },
                      { value: TaskPriority.URGENT, label: 'URGENT', color: 'text-red-400' }
                    ]}
                    className="bg-white/5 border-white/5 rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-white/5 border border-white/5 rounded-xl h-10 px-4 text-xs focus:ring-1 focus:ring-primary/50 outline-none transition-all font-bold text-white [color-scheme:dark]"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Est. Hours</label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/5 rounded-xl h-10 px-4 text-xs focus:ring-1 focus:ring-primary/50 outline-none transition-all font-bold text-white"
                    placeholder="0"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/5 flex gap-3 bg-white/[0.01]">
            <Button
              type="submit"
              form="create-task-form"
              className="flex-1 h-10 text-xs font-black uppercase tracking-widest rounded-xl"
              disabled={isLoading || isFetchingEmployees}
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" size={14} /> : <Plus size={14} className="mr-2" />}
              Create Task
            </Button>
            <Button
              type="button"
              variant="outline"
              className="px-6 h-10 text-xs font-black uppercase tracking-widest rounded-xl border-white/10"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
