'use client';

import { cn } from '@/lib/utils';
import { format, differenceInMinutes } from 'date-fns';
import { Clock, Coffee, LogOut, MapPin } from 'lucide-react';

interface TimelineEvent {
  time: Date;
  type: 'CHECK_IN' | 'BREAK_START' | 'BREAK_END' | 'CHECK_OUT';
  label: string;
}

interface AttendanceTimelineProps {
  record: any;
}

export function AttendanceTimeline({ record }: AttendanceTimelineProps) {
  if (!record || !record.checkIn) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-divider rounded-2xl bg-muted/10">
        <Clock className="text-muted-foreground/20 mb-2" size={32} />
        <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Ready for check-in</p>
      </div>
    );
  }

  const events: TimelineEvent[] = [
    { time: new Date(record.checkIn), type: 'CHECK_IN', label: 'Shift Started' }
  ];

  record.breaks?.forEach((b: any) => {
    if (b.startTime) {
      events.push({ time: new Date(b.startTime), type: 'BREAK_START', label: 'Break Started' });
    }
    if (b.endTime) {
      events.push({ time: new Date(b.endTime), type: 'BREAK_END', label: 'Resumed Work' });
    }
  });

  if (record.checkOut) {
    events.push({ time: new Date(record.checkOut), type: 'CHECK_OUT', label: 'Shift Completed' });
  }

  // Sort events by time
  events.sort((a, b) => a.time.getTime() - b.time.getTime());

  return (
    <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-divider before:rounded-full">
      {events.map((event, index) => {
        const Icon = event.type === 'CHECK_IN' ? Clock : 
                     event.type === 'CHECK_OUT' ? LogOut : 
                     Coffee;
        
        const isCurrent = index === events.length - 1 && !record.checkOut;

        return (
          <div key={index} className="relative group">
            {/* Circle on line */}
            <div className={cn(
              "absolute -left-[30px] top-1 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center transition-all duration-500",
              event.type === 'CHECK_IN' ? 'bg-primary shadow-[0_0_10px_rgba(79,70,229,0.4)]' :
              event.type === 'CHECK_OUT' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' :
              'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
              isCurrent && "animate-pulse"
            )}>
              <Icon size={10} className="text-white" />
            </div>

            <div className="bg-muted/20 border border-divider rounded-2xl p-4 transition-all hover:bg-muted/40 hover:border-primary/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none mb-1">{event.label}</p>
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter opacity-40">
                    {format(event.time, 'HH:mm:ss')} • {format(event.time, 'MMM dd')}
                  </p>
                </div>
                {index > 0 && (
                  <div className="text-right">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Duration</p>
                    <p className="text-[10px] font-bold text-foreground">
                      {differenceInMinutes(event.time, events[index - 1].time)}m
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Connecting visual dash for active state */}
            {isCurrent && (
              <div className="mt-4 flex items-center gap-2 pl-4">
                 <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                 <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Recording live session...</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
