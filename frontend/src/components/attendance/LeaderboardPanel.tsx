'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { cn } from '@/lib/utils';

export function LeaderboardPanel() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/leaderboard')
      .then(res => setLeaders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-divider rounded-[32px] p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
      </div>
    );
  }

  if (leaders.length === 0) return null;

  const rankIcons = [
    { Icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { Icon: Medal, color: 'text-slate-300', bg: 'bg-slate-300/10' },
    { Icon: Medal, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <div className="bg-card border border-divider rounded-[32px] p-8 space-y-6 shadow-sm overflow-hidden relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Trophy size={18} />
          </div>
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Monthly Titans</h3>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Top by work hours</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {leaders.map((leader, i) => {
          const rank = rankIcons[i] || rankIcons[1];
          const { Icon: RankIcon } = rank;
          const hours = Math.floor(leader.minutes / 60);
          
          return (
            <div 
              key={i} 
              className="flex items-center justify-between p-4 bg-muted/20 border border-divider rounded-2xl hover:bg-muted/30 transition-all cursor-default"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center relative", rank.bg, rank.color)}>
                  <RankIcon size={20} />
                  <span className="absolute -top-1 -right-1 text-[8px] font-black">{i + 1}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{leader.name}</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-40">Elite Contributor</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-sm font-black text-foreground tabular-nums">{hours}h</p>
                 <p className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Logged</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="pt-2">
         <p className="text-[8px] text-center font-black text-muted-foreground uppercase tracking-widest opacity-20">Leaderboard updates daily</p>
      </div>
    </div>
  );
}
