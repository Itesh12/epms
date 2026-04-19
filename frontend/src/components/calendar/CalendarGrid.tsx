'use client';

import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isToday 
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Trash2, AlertCircle, Info } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

interface CalendarGridProps {
  currentDate: Date;
  events: any[];
  isAdmin: boolean;
  onRefresh: () => void;
}

export function CalendarGrid({ currentDate, events, isAdmin, onRefresh }: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.startDate), day));
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
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

  const typeConfig: any = {
    HOLIDAY: { dot: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
    EVENT: { dot: 'bg-primary', text: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
    OFFICE_CLOSURE: { dot: 'bg-slate-500', text: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20' },
    DEADLINE: { dot: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    TEAM_OUTING: { dot: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    OTHER: { dot: 'bg-muted-foreground', text: 'text-muted-foreground', bg: 'bg-muted/10 border-divider' },
  };

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-muted/5">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 border-b border-divider bg-muted/20">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-4 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-1 bg-divider gap-[1px]">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);

          return (
            <div 
              key={idx} 
              className={cn(
                "min-h-[140px] p-3 transition-colors bg-card flex flex-col gap-2 group/day",
                !isCurrentMonth && "bg-muted/10 opacity-30",
                isTodayDate && "bg-primary/[0.03]"
              )}
            >
              <div className="flex items-center justify-between pointer-events-none">
                <span className={cn(
                  "text-sm font-black tabular-nums transition-all",
                  isTodayDate ? "text-primary scale-125" : "text-foreground group-hover/day:text-primary/60",
                  !isCurrentMonth && "text-muted-foreground"
                )}>
                  {format(day, 'd')}
                </span>
                {isTodayDate && (
                  <span className="text-[8px] font-black uppercase tracking-tighter text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">Today</span>
                )}
              </div>

              <div className="space-y-1.5 flex-1 max-h-[120px] overflow-y-auto no-scrollbar">
                {dayEvents.map((event, eIdx) => {
                  const cfg = typeConfig[event.type] || typeConfig.OTHER;
                  return (
                    <div 
                      key={eIdx} 
                      className={cn(
                        "group relative px-2 py-1.5 rounded-lg border flex flex-col gap-0.5 transition-all animate-in zoom-in-95 cursor-default",
                        cfg.bg
                      )}
                      title={event.description}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                          <span className={cn("text-[10px] font-bold leading-none truncate uppercase tracking-tight", cfg.text)}>
                            {event.title}
                          </span>
                        </div>
                        {isAdmin && (
                          <button 
                            onClick={(e) => handleDelete(e, event._id)}
                            className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
