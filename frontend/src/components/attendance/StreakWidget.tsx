'use client';

import { useMemo } from 'react';
import { Flame, Star, Trophy, Target, History as HistoryIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isWeekend, subDays, format, parseISO } from 'date-fns';

interface StreakWidgetProps {
  history: any[];
}

export function StreakWidget({ history }: StreakWidgetProps) {
  const streakData = useMemo(() => {
    if (!history || history.length === 0) return { current: 0, longest: 0, level: 0 };

    // Sort history by date descending
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    // Check if streak is active (has record today or yesterday)
    const hasTodayOrYesterday = sorted.some(r => 
      (r.date === today || r.date === yesterday) && 
      (r.status === 'PRESENT' || r.status === 'LATE' || r.status === 'HALF_DAY')
    );

    if (!hasTodayOrYesterday) currentStreak = 0;

    // Simplified streak calculation: find consecutive dates in history
    let lastDate: Date | null = null;
    
    // To handle streaks properly, we should consider only PRESENT/LATE/HALF_DAY
    const validRecords = sorted.filter(r => r.status === 'PRESENT' || r.status === 'LATE' || r.status === 'HALF_DAY');
    
    if (validRecords.length > 0) {
      currentStreak = 1;
      let checkDate = parseISO(validRecords[0].date);
      
      // If the latest record is older than yesterday, current streak is 0
      if (validRecords[0].date !== today && validRecords[0].date !== yesterday) {
        currentStreak = 0;
      }

      for (let i = 1; i < validRecords.length; i++) {
        const prevDate = parseISO(validRecords[i].date);
        const diffDays = Math.round((checkDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // If they are consecutive days, or separated only by a weekend
        let isConsecutive = diffDays === 1;
        if (diffDays > 1 && diffDays <= 3) {
           // check if days between are weekends
           let allWeekends = true;
           for(let d=1; d < diffDays; d++) {
             if (!isWeekend(subDays(checkDate, d))) {
               allWeekends = false;
               break;
             }
           }
           if (allWeekends) isConsecutive = true;
        }

        if (isConsecutive) {
          if (currentStreak > 0 && i === currentStreak) currentStreak++;
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak + 1);
          tempStreak = 0;
        }
        checkDate = prevDate;
      }
      longestStreak = Math.max(longestStreak, tempStreak + 1, currentStreak);
    }

    const level = currentStreak >= 20 ? 3 : currentStreak >= 10 ? 2 : currentStreak >= 5 ? 1 : 0;
    
    return { current: currentStreak, longest: longestStreak, level };
  }, [history]);

  const levelConfigs = [
    { label: 'Starter', icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Consistent', icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Determined', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Unstoppable', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' },
  ];

  const config = levelConfigs[streakData.level];
  const Icon = config.icon;

  return (
    <div className="bg-card border border-divider rounded-[32px] p-8 space-y-6 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl transition-transform duration-500 group-hover:scale-110", config.bg, config.color)}>
            <Flame size={18} fill={streakData.current > 0 ? "currentColor" : "none"} />
          </div>
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Growth Streak</h3>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Consistency is key</p>
          </div>
        </div>
      </div>

      <div className="flex items-baseline gap-2 relative z-10">
        <p className={cn("text-5xl font-black tracking-tighter tabular-nums transition-colors duration-500", config.color)}>
          {streakData.current}
        </p>
        <p className="text-xs font-black text-muted-foreground uppercase opacity-40">Days</p>
      </div>

      <div className="space-y-4 relative z-10">
        <div className={cn("flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all duration-500", config.bg)}>
          <Icon size={14} className={config.color} />
          <div>
             <p className={cn("text-[10px] font-black uppercase tracking-widest leading-none", config.color)}>{config.label}</p>
             <p className="text-[8px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Level {streakData.level + 1}</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-2">
              <HistoryIcon className="w-3 h-3 text-muted-foreground opacity-30" />
              <span className="text-[9px] font-black text-muted-foreground opacity-40 uppercase">Record: {streakData.longest} days</span>
           </div>
           {streakData.current > 0 && (
             <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
           )}
        </div>
      </div>
    </div>
  );
}
