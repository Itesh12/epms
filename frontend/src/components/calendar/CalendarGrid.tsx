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
  onSelectDay: (day: Date, events: any[]) => void;
}

export function CalendarGrid({ currentDate, events, isAdmin, onRefresh, onSelectDay }: CalendarGridProps) {
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

  const typeConfig: any = {
    HOLIDAY: { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-500/5 hover:bg-red-500/10' },
    EVENT: { border: 'border-primary', text: 'text-primary', bg: 'bg-primary/5 hover:bg-primary/10' },
    OFFICE_CLOSURE: { border: 'border-slate-500', text: 'text-slate-500', bg: 'bg-slate-500/5 hover:bg-slate-500/10' },
    DEADLINE: { border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/5 hover:bg-amber-500/10' },
    TEAM_OUTING: { border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/5 hover:bg-emerald-500/10' },
    OTHER: { border: 'border-divider', text: 'text-muted-foreground', bg: 'bg-muted/5 hover:bg-muted/10' },
  };

  return (
    <div className="flex flex-col h-full rounded-[32px] overflow-hidden bg-card border border-divider shadow-2xl">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 border-b border-divider bg-muted/5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-6 text-center border-r border-divider/50 last:border-r-0">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-1 bg-divider/10 gap-px">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);
          const displayEvents = dayEvents.slice(0, 2);
          const moreCount = dayEvents.length - displayEvents.length;

          return (
            <div 
              key={idx} 
              onClick={() => onSelectDay(day, dayEvents)}
              className={cn(
                "min-h-[140px] lg:min-h-[160px] p-4 transition-all duration-300 bg-card flex flex-col gap-3 group/day cursor-pointer relative",
                !isCurrentMonth && "bg-muted/[0.03] opacity-25",
                isTodayDate && "after:absolute after:inset-0 after:bg-primary/[0.03] after:pointer-events-none"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-base font-black tabular-nums transition-colors",
                  isTodayDate ? "text-primary px-2.5 py-1 bg-primary/10 rounded-xl" : "text-foreground group-hover/day:text-primary",
                  !isCurrentMonth && "text-muted-foreground"
                )}>
                  {format(day, 'd')}
                </span>
                
                {isAdmin && (
                  <div className="opacity-0 group-hover/day:opacity-40 transition-opacity">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                       <span className="text-xs font-black">+</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 flex-1 overflow-hidden pointer-events-none">
                {displayEvents.map((event, eIdx) => {
                  const cfg = typeConfig[event.type] || typeConfig.OTHER;
                  return (
                    <div 
                      key={eIdx} 
                      className={cn(
                        "group/evt pl-2.5 pr-2 py-2 rounded-xl border-l-[3px] transition-all flex flex-col gap-0.5",
                        cfg.bg,
                        cfg.border
                      )}
                    >
                      <span className={cn("text-[9px] font-black uppercase tracking-widest truncate leading-tight", cfg.text)}>
                        {event.title}
                      </span>
                    </div>
                  );
                })}

                {moreCount > 0 && (
                   <div className="mt-1 flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full w-fit">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                        +{moreCount} more
                      </span>
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

