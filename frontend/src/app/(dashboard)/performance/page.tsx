'use client';

import { useEffect, useState } from 'react';
import { 
  Trophy, TrendingUp, Clock, Target, 
  Loader2, ArrowUpRight, ArrowDownRight, User
} from 'lucide-react';
import api from '@/services/api';

export default function PerformancePage() {
  const [performance, setPerformance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPerformance() {
      try {
        const res = await api.get('/analytics/performance');
        setPerformance(res.data);
      } catch (error) {
        console.error('Failed to fetch performance metrics', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPerformance();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <Trophy className="text-primary" size={32} />
          Performance Rankings
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Real-time productivity scoring based on task completion efficiency and punctuality.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performer Card */}
        {performance[0] && (
          <div className="bg-primary rounded-3xl p-6 text-primary-foreground shadow-2xl shadow-primary/20 flex flex-col justify-between min-h-[220px]">
            <div>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest border border-white/10">Top Performer</span>
              <h2 className="text-2xl font-bold mt-4 break-all">{performance[0].email}</h2>
            </div>
            <div className="flex items-end justify-between">
               <div className="space-y-1">
                 <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Efficiency Score</p>
                 <p className="text-4xl font-black">{Math.round(performance[0].efficiency)}%</p>
               </div>
               <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                 <Trophy size={32} />
               </div>
            </div>
          </div>
        )}

        {/* Aggregate Metrics */}
        <div className="bg-card border rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
               <Target size={20} />
             </div>
             <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Team Punctuality</p>
          </div>
          <p className="text-4xl font-black text-foreground">
            {performance.length > 0 ? Math.round(performance.reduce((acc, curr) => acc + curr.punctuality, 0) / performance.length) : 0}%
          </p>
          <div className="flex items-center gap-1 text-emerald-500 text-sm font-bold mt-2">
            <ArrowUpRight size={16} />
            On track this cycle
          </div>
        </div>

        <div className="bg-card border rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
               <Clock size={20} />
             </div>
             <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Avg. Delivery Speed</p>
          </div>
          <p className="text-4xl font-black text-foreground">
            1.2x
          </p>
          <div className="flex items-center gap-1 text-blue-500 text-sm font-bold mt-2">
            <TrendingUp size={16} />
            Outperforming estimates
          </div>
        </div>
      </div>

      {/* Detailed Leaderboard Table */}
      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b">
          <h3 className="font-bold text-lg">Workforce Efficiency Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-muted/30 border-b">
               <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                 <th className="px-6 py-4">Employee</th>
                 <th className="px-6 py-4 text-center">Tasks Completed</th>
                 <th className="px-6 py-4 text-center">Efficiency Score</th>
                 <th className="px-6 py-4 text-center">Punctuality Rate</th>
                 <th className="px-6 py-4 text-right">Trend</th>
               </tr>
             </thead>
             <tbody className="divide-y">
               {performance.map((member, index) => (
                 <tr key={member.email} className="group hover:bg-muted/10 transition-colors">
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          index === 0 ? 'bg-amber-400 text-white shadow-md shadow-amber-400/20' : 'bg-primary/10 text-primary'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{member.email}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Engineering Team</p>
                        </div>
                     </div>
                   </td>
                   <td className="px-6 py-4 text-center">
                     <span className="text-sm font-bold text-foreground px-3 py-1 bg-muted rounded-full">
                       {member.totalCompleted}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-sm font-black ${member.efficiency >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {Math.round(member.efficiency)}%
                        </span>
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                           <div 
                             className={`h-full transition-all duration-1000 ${member.efficiency >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                             style={{ width: `${Math.min(member.efficiency, 100)}%` }} 
                           />
                        </div>
                      </div>
                   </td>
                   <td className="px-6 py-4 text-center font-bold text-sm text-foreground">
                      {Math.round(member.punctuality)}%
                   </td>
                   <td className="px-6 py-4 text-right pr-8">
                      {member.efficiency >= 100 ? (
                        <ArrowUpRight className="text-emerald-500 inline" size={18} />
                      ) : (
                        <ArrowDownRight className="text-amber-500 inline" size={18} />
                      )}
                   </td>
                 </tr>
               ))}
               {performance.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground font-medium">
                     No completed task data available for performance routing.
                   </td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
