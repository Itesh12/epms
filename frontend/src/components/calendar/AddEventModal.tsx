'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Type, AlignLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

const EVENT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'HOLIDAY', label: 'Public Holiday' },
  { value: 'EVENT', label: 'Company Event' },
  { value: 'OFFICE_CLOSURE', label: 'Office Closure' },
  { value: 'DEADLINE', label: 'Important Deadline' },
  { value: 'TEAM_OUTING', label: 'Team Outing' },
  { value: 'OTHER', label: 'Other/Miscellaneous' },
];

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialEvent?: any;
  preSelectedDate?: string;
}

export function AddEventModal({ isOpen, onClose, onSuccess, initialEvent, preSelectedDate }: AddEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    type: 'EVENT',
  });

  // Sync state with initialEvent or preSelectedDate
  useState(() => {
    if (initialEvent) {
      setFormData({
        title: initialEvent.title || '',
        description: initialEvent.description || '',
        startDate: initialEvent.startDate ? new Date(initialEvent.startDate).toISOString().split('T')[0] : '',
        type: initialEvent.type || 'EVENT',
      });
    } else if (preSelectedDate) {
      setFormData(prev => ({ ...prev, startDate: preSelectedDate }));
    }
  });

  // Also sync on prop changes when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialEvent) {
        setFormData({
          title: initialEvent.title || '',
          description: initialEvent.description || '',
          startDate: initialEvent.startDate ? new Date(initialEvent.startDate).toISOString().split('T')[0] : '',
          type: initialEvent.type || 'EVENT',
        });
      } else if (preSelectedDate) {
        setFormData({
           title: '',
           description: '',
           startDate: preSelectedDate,
           type: 'EVENT'
        });
      } else {
        setFormData({ title: '', description: '', startDate: '', type: 'EVENT' });
      }
    }
  }, [isOpen, initialEvent, preSelectedDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate) {
      toast.error('Title and Date are required');
      return;
    }

    setLoading(true);
    try {
      if (initialEvent?._id) {
        await api.patch(`/calendar/${initialEvent._id}`, formData);
        toast.success('Event updated successfully');
      } else {
        await api.post('/calendar', formData);
        toast.success('Event added successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-card border border-divider rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-divider bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Calendar size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight leading-none mb-1">
                {initialEvent ? 'Edit Hub Entry' : 'New Hub Entry'}
              </h2>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">
                {initialEvent ? 'Update existing activity' : 'Schedule an organization event'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Event Title</label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                <input
                  required
                  type="text"
                  placeholder="e.g. Annual Town Hall"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-muted/20 border border-divider rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                <input
                  required
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-muted/20 border border-divider rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Event Category</label>
              <CustomSelect
                value={formData.type}
                onChange={(val) => setFormData({ ...formData, type: val })}
                options={EVENT_TYPE_OPTIONS}
                className="h-14 rounded-2xl font-bold bg-muted/20 border-divider"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Description (Optional)</label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 text-muted-foreground/40" size={16} />
                <textarea
                  rows={3}
                  placeholder="Tell us more about this event..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-muted/20 border border-divider rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/20 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest border-divider">
              Cancel
            </Button>
            <Button disabled={loading} type="submit" className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20">
              {loading ? 'Saving...' : initialEvent ? 'Update Entry' : 'Confirm Entry'}
            </Button>
          </div>
          
          <div className="flex items-start gap-2.5 p-4 bg-primary/5 rounded-2xl border border-primary/10 opacity-60">
             <Info size={14} className="text-primary shrink-0 mt-0.5" />
             <p className="text-[10px] font-medium leading-relaxed text-foreground">
               Visible to all employees across the organization once published.
             </p>
          </div>
        </form>
      </div>
    </div>
  );
}
