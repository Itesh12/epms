'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle,
  MoreVertical,
  Activity,
  History
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO,
  isToday
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface AttendanceCalendarProps {
  history: any[];
  onDayClick?: (date: string, record?: any) => void;
  isLoading?: boolean;
}

export function AttendanceCalendar({ history, onDayClick, isLoading }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const historyMap = useMemo(() => {
    const map = new Map<string, any>();
    history.forEach(record => {
      map.set(record.date, record);
    });
    return map;
  }, [history]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
    PRESENT:  { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
    LATE:     { color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/20',   icon: Clock },
    HALF_DAY: { color: 'text-blue-500',    bg: 'bg-blue-500/10 border-blue-500/20',    icon: AlertTriangle },
    ABSENT:   { color: 'text-red-500',     bg: 'bg-red-500/10 border-red-500/20',      icon: XCircle },
  };

  return (
    <div className="bg-card border border-divider rounded-[32px] overflow-hidden shadow-sm flex flex-col h-full animate-in fade-in duration-500">
      {/* Calendar Header */}
      <div className="p-8 border-b border-divider flex items-center justify-between bg-muted/5">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground uppercase tracking-widest">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">
              Interactive Attendance History
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday} className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-divider">
            Today
          </Button>
          <div className="flex h-9 bg-muted/20 border border-divider rounded-xl p-0.5">
            <button
              onClick={prevMonth}
              className="px-2 hover:bg-card hover:text-primary rounded-lg transition-all text-muted-foreground"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextMonth}
              className="px-2 hover:bg-card hover:text-primary rounded-lg transition-all text-muted-foreground"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 border-b border-divider bg-muted/10">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr min-h-[500px]">
        {days.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const record = historyMap.get(dateStr);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelectedDay = isToday(day);
          const config = record ? statusConfig[record.status] : null;
          const Icon = config?.icon;

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick?.(dateStr, record)}
              className={cn(
                "group relative p-4 border-r border-b border-divider/50 min-h-[100px] transition-all cursor-pointer",
                !isCurrentMonth && "bg-muted/5 opacity-30 cursor-default pointer-events-none",
                isCurrentMonth && "hover:bg-primary/[0.02]",
                isSelectedDay && "bg-primary/[0.03]"
              )}
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                  "text-xs font-black tracking-tight",
                  isSelectedDay ? "text-primary" : "text-foreground/40",
                  !isCurrentMonth && "text-muted-foreground/20"
                )}>
                  {format(day, 'd')}
                </span>
                {record && (
                   <div className={cn("p-1.5 rounded-lg border", config?.bg)}>
                      <Icon size={12} className={config?.color} />
                   </div>
                )}
              </div>

              {record && (
                <div className="mt-3 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-[10px] font-black text-foreground truncate">
                    {record.checkIn ? format(new Date(record.checkIn), 'HH:mm') : '--:--'}
                    {record.checkOut ? ` - ${format(new Date(record.checkOut), 'HH:mm')}` : ' - ...'}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Activity size={10} className="text-muted-foreground opacity-40 shrink-0" />
                    <p className="text-[9px] font-bold text-muted-foreground truncate uppercase">
                      {Math.floor((record.totalWorkMinutes || 0) / 60)}h {(record.totalWorkMinutes || 0) % 60}m logged
                    </p>
                  </div>
                </div>
              )}
              
              {isSelectedDay && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full">
                   <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                   <span className="text-[7px] font-black text-primary uppercase tracking-widest">Today</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-6 border-t border-divider bg-muted/5 flex flex-wrap gap-8 justify-center">
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <div key={key} className="flex items-center gap-2.5">
              <div className={cn("p-1.5 rounded-lg border", config.bg)}>
                <Icon size={12} className={config.color} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                {key.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
