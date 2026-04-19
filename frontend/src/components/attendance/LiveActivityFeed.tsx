'use client';

import { useState, useEffect } from 'react';
import { Activity, Clock, Coffee, Circle, User } from 'lucide-react';
import api from '@/services/api';
import { format, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';

export function LiveActivityFeed() {
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLive = async () => {
    try {
      const res = await api.get('/attendance/admin/live');
      setLiveUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch live activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && liveUsers.length === 0) return null;

  return (
    <div className="bg-card border border-divider rounded-[32px] overflow-hidden shadow-sm animate-in fade-in duration-700">
      <div className="p-6 border-b border-divider flex items-center justify-between bg-emerald-500/[0.02]">
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
               <Activity size={16} />
             </div>
             <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Live Presence</h3>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Currently active workforce</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{liveUsers.length} Online</span>
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-2 px-2">
          {liveUsers.length === 0 ? (
             <div className="w-full py-4 text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-30 italic">No one is currently clocked in</p>
             </div>
          ) : (
            liveUsers.map((rec) => {
              const isOnBreak = rec.breaks?.some((b: any) => !b.endTime);
              const activeSince = rec.checkIn ? differenceInMinutes(new Date(), new Date(rec.checkIn)) : 0;
              
              return (
                <div key={rec._id} className="flex items-center gap-3 p-3 bg-muted/20 border border-divider rounded-2xl hover:bg-muted/40 transition-all cursor-default group min-w-[200px]">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-black uppercase">
                       {rec.userId?.firstName?.[0]}
                    </div>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card flex items-center justify-center",
                      isOnBreak ? "bg-amber-500" : "bg-emerald-500"
                    )}>
                      {isOnBreak ? <Coffee size={6} className="text-white" /> : <Clock size={6} className="text-white" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-foreground line-clamp-1">{rec.userId?.firstName} {rec.userId?.lastName}</p>
                    <div className="flex items-center gap-1.5 opacity-60">
                       <span className={cn(
                         "text-[8px] font-black uppercase tracking-widest",
                         isOnBreak ? "text-amber-600" : "text-emerald-600"
                       )}>
                         {isOnBreak ? 'On Break' : 'Working'}
                       </span>
                       <span className="text-[8px] font-medium text-muted-foreground tabular-nums">• {Math.floor(activeSince / 60)}h {activeSince % 60}m</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
