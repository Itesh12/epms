'use client';

import { X, Calendar, Clock, Trash2, Edit2, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

interface DayDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  events: any[];
  isAdmin: boolean;
  onRefresh: () => void;
  onEdit: (event: any) => void;
}

const typeConfig: any = {
  HOLIDAY: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Public Holiday' },
  EVENT: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', label: 'Company Event' },
  OFFICE_CLOSURE: { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: 'Office Closure' },
  DEADLINE: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Important Deadline' },
  TEAM_OUTING: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Team Outing' },
  OTHER: { color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-divider', label: 'Other' },
};

export function DayDetailsDrawer({ isOpen, onClose, date, events, isAdmin, onRefresh, onEdit }: DayDetailsDrawerProps) {
  if (!date) return null;

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.delete(`/calendar/${id}`);
      toast.success('Event removed');
      onRefresh();
    } catch {
      toast.error('Failed to delete event');
    }
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-lg bg-card border-l border-divider z-[101] shadow-2xl transition-transform duration-500 ease-out flex flex-col cursor-default",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-divider flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Calendar size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Timeline View</h2>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">
                Summary for {format(date, 'MMMM dd, yyyy')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
           {events.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20 py-20 text-center">
                <AlertCircle size={48} strokeWidth={1} />
                <p className="text-sm font-black uppercase tracking-widest">No scheduled events for this day</p>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Schedules & Markers</h4>
                   <div className="h-px flex-1 mx-4 bg-divider opacity-40" />
                </div>

                <div className="space-y-4">
                  {events.map((event, idx) => {
                    const cfg = typeConfig[event.type] || typeConfig.OTHER;
                    return (
                      <div 
                        key={idx} 
                        className={cn(
                          "group p-6 rounded-[24px] border transition-all hover:shadow-lg hover:shadow-primary/5",
                          cfg.bg,
                          cfg.border
                        )}
                      >
                         <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                               <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border", cfg.border, cfg.color)}>
                                 {cfg.label}
                               </span>
                            </div>
                            {isAdmin && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => onEdit(event)}
                                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(event._id)}
                                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                         </div>

                         <h3 className="text-lg font-black text-foreground mb-2 leading-tight">
                            {event.title}
                         </h3>
                         {event.description && (
                           <p className="text-sm text-muted-foreground/80 leading-relaxed italic mb-4">
                             "{event.description}"
                           </p>
                         )}

                         <div className="flex items-center gap-3 pt-4 border-t border-divider/10 mt-auto">
                            <div className="flex items-center gap-1.5 opacity-40">
                               <Clock size={12} />
                               <span className="text-[10px] font-bold uppercase tracking-wider">Created on {format(new Date(event.createdAt), 'MMM dd, HH:mm')}</span>
                            </div>
                         </div>
                      </div>
                    );
                  })}
                </div>
             </div>
           )}
        </div>

        {/* Footer */}
        {isAdmin && (
          <div className="p-8 border-t border-divider bg-muted/5">
             <Button 
               onClick={() => {
                 onClose();
                 // This should be handled by the parent to open the modal
                 onEdit(null); // Passing null implies adding for this date
               }}
               className="w-full h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest gap-2 shadow-xl shadow-primary/20"
             >
               Add Another Entry
             </Button>
          </div>
        )}
      </div>
    </>
  );
}
