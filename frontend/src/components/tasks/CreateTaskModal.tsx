'use client';

import { useState, useEffect } from 'react';
import { 
  X, Loader2, Calendar, 
  BarChart, Users, Type, AlignLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { TaskStatus, TaskPriority } from '@/types/task';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
}

export function CreateTaskModal({ isOpen, onClose, onSuccess, projectId }: CreateTaskModalProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Type size={20} />
            </div>
            Create New Task
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 col-span-full">
              <Input 
                label="Task Title" 
                placeholder="What needs to be done?" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Detailed Description</label>
                <textarea 
                  className="w-full bg-muted/50 border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all min-h-[100px] font-medium"
                  placeholder="Describe the scope of work..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users size={14} className="text-primary" /> Assign To
              </label>
              <CustomSelect 
                value={assigneeId}
                onChange={setAssigneeId}
                options={[
                  { value: '', label: 'Select Employee', color: 'text-muted-foreground' },
                  ...employees.map(emp => ({ value: emp._id, label: `${emp.email} (${emp.role})` }))
                ]}
                className="bg-muted/50 border rounded-xl py-3 px-4 text-sm font-medium hover:bg-muted focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <BarChart size={14} className="text-primary" /> Priority
              </label>
              <CustomSelect 
                value={priority}
                onChange={(v) => setPriority(v as TaskPriority)}
                options={[
                  { value: TaskPriority.LOW, label: 'Low', color: 'text-slate-400' },
                  { value: TaskPriority.MEDIUM, label: 'Medium', color: 'text-blue-400' },
                  { value: TaskPriority.HIGH, label: 'High', color: 'text-orange-400' },
                  { value: TaskPriority.URGENT, label: 'Urgent', color: 'text-red-400' }
                ]}
                className="bg-muted/50 border rounded-xl py-3 px-4 text-sm font-medium hover:bg-muted focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-bold text-foreground flex items-center gap-2">
                 <Calendar size={14} className="text-primary" /> Due Date
               </label>
               <input 
                 type="date"
                 className="w-full bg-muted/50 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary transition-all font-medium"
                 value={dueDate}
                 onChange={(e) => setDueDate(e.target.value)}
               />
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-bold text-foreground flex items-center gap-2">
                 <Loader2 size={14} className="text-primary" /> Estimated Hours
               </label>
               <input 
                 type="number"
                 className="w-full bg-muted/50 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary transition-all font-medium"
                 value={estimatedHours}
                 onChange={(e) => setEstimatedHours(Number(e.target.value))}
                 min="0"
               />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="submit" className="flex-1 h-12" disabled={isLoading || isFetchingEmployees}>
              {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
              Create Task
            </Button>
            <Button type="button" variant="ghost" className="h-12" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
