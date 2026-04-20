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
    <div className="flex flex-col h-full rounded-[24px] overflow-hidden bg-card border border-divider shadow-xl">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 border-b border-divider bg-muted/5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-4 text-center border-r border-divider/40 last:border-r-0">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-1 bg-divider/5 gap-px">
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
                "min-h-[110px] lg:min-h-[140px] p-2.5 lg:p-4 transition-all duration-300 bg-card flex flex-col gap-2 group/day cursor-pointer relative",
                !isCurrentMonth && "bg-muted/[0.02] opacity-20",
                isTodayDate && "after:absolute after:inset-0 after:bg-primary/[0.02] after:pointer-events-none"
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={cn(
                  "text-xs lg:text-sm font-black tabular-nums transition-colors",
                  isTodayDate ? "text-primary px-2 py-0.5 bg-primary/10 rounded-lg" : "text-foreground group-hover/day:text-primary",
                  !isCurrentMonth && "text-muted-foreground"
                )}>
                  {format(day, 'd')}
                </span>
                
                {isAdmin && (
                  <div className="opacity-0 group-hover/day:opacity-30 transition-opacity hidden lg:block">
                    <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                       <span className="text-[10px] font-black">+</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Display: Labels */}
              <div className="hidden md:flex flex-col gap-1 flex-1 overflow-hidden pointer-events-none">
                {displayEvents.map((event, eIdx) => {
                  const cfg = typeConfig[event.type] || typeConfig.OTHER;
                  return (
                    <div 
                      key={eIdx} 
                      className={cn(
                        "group/evt pl-2 pr-1.5 py-1.5 rounded-lg border-l-[2px] transition-all flex flex-col gap-0",
                        cfg.bg,
                        cfg.border
                      )}
                    >
                      <span className={cn("text-[8px] font-black uppercase tracking-wider truncate leading-tight", cfg.text)}>
                        {event.title}
                      </span>
                    </div>
                  );
                })}

                {moreCount > 0 && (
                   <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded-full w-fit">
                      <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                        +{moreCount} more
                      </span>
                   </div>
                )}
              </div>

              {/* Mobile Display: Dot Indicators */}
              <div className="flex md:hidden flex-wrap gap-1 mt-auto pointer-events-none">
                {dayEvents.map((event, eIdx) => {
                   const cfg = typeConfig[event.type] || typeConfig.OTHER;
                   return (
                     <div 
                       key={eIdx} 
                       className={cn("w-1.5 h-1.5 rounded-full", cfg.text.replace('text-', 'bg-'))} 
                     />
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


