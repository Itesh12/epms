'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Clock,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';

function StatCard({ title, value, icon, trend, color }: { title: string, value: string | number, icon: React.ReactNode, trend: string, color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/5',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5',
  };

  return (
    <div className="astra-card bg-card border border-divider p-4 rounded-2xl group shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-500 ${colorMap[color]}`}>
          {typeof icon === 'object' && (icon as any).type ? (icon as any) : icon} 
          {/* Note: In React we just render icon, but I'll ensure size passed is small */}
        </div>
        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{title}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-2xl font-black text-foreground tracking-tight">{value}</h2>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary/40 rounded-full w-2/3" />
        </div>
        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap opacity-40">{trend}</span>
      </div>
    </div>
  );
}

function ActivityItem({ text, time }: { text: string, time: string }) {
  return (
    <div className="flex gap-3 pb-4 border-b border-divider last:border-none last:pb-0 group relative">
      <div className="relative">
        <div className="w-2 h-2 rounded-full bg-primary/20 mt-1.5 shrink-0 group-hover:bg-primary transition-all duration-300 z-10 relative" />
        <div className="absolute top-4 bottom-0 left-[3.5px] w-[1px] bg-divider group-last:hidden" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-foreground opacity-80 group-hover:opacity-100 transition-opacity leading-relaxed">{text}</p>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 opacity-40">{time}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res: any = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1400px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-primary/20">System Status</span>
          </div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-widest leading-none">
            Hello, <span className="text-primary">{user?.email.split('@')[0]}</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2 max-w-xl opacity-60">
            System efficiency is at <span className="text-foreground font-bold">94%</span>. Action items pending review.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="talents" 
          value={stats?.totalEmployees || '0'} 
          icon={<Users size={18} strokeWidth={2.5} />} 
          trend="+2 recent"
          color="blue"
        />
        <StatCard 
          title="projects" 
          value={stats?.totalProjects || '0'} 
          icon={<Briefcase size={18} strokeWidth={2.5} />} 
          trend="4 high priority"
          color="indigo"
        />
        <StatCard 
          title="completed" 
          value={stats?.projectDistribution?.DONE || '0'} 
          icon={<CheckCircle2 size={18} strokeWidth={2.5} />} 
          trend="98% accuracy"
          color="emerald"
        />
        <StatCard 
          title="active" 
          value={stats?.projectDistribution?.IN_PROGRESS || '0'} 
          icon={<Clock size={18} strokeWidth={2.5} />} 
          trend="Optimal load"
          color="amber"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-divider rounded-2xl p-6 flex flex-col relative overflow-hidden group shadow-sm">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">System Dynamics</h3>
              <p className="text-[9px] font-black text-muted-foreground mt-1 uppercase tracking-widest opacity-40">Velocity Stream</p>
            </div>
            <div className="flex gap-2">
               <div className="px-2 py-1 bg-muted/50 rounded-md text-[9px] font-black text-muted-foreground uppercase tracking-widest border border-divider opacity-60">MTD</div>
            </div>
          </div>

          <div className="flex-1 min-h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.performanceVelocity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 9, fontWeight: 900 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 9, fontWeight: 900 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--divider)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    padding: '8px'
                  }}
                  itemStyle={{ color: 'var(--foreground)', fontWeight: 900, fontSize: '11px' }}
                  labelStyle={{ color: 'var(--muted-foreground)', fontWeight: 900, fontSize: '9px', marginBottom: '4px', textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="var(--primary)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-divider rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Recent Activity</h3>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          
          {stats?.recentActivity?.length > 0 ? (
            <div className="space-y-6 flex-1">
              {stats.recentActivity.map((act: any, idx: number) => (
                <ActivityItem key={idx} text={act.text} time={act.time} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full space-y-3 opacity-20">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-divider">
                <Clock size={20} className="text-muted-foreground" />
              </div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-4 opacity-40">
                No activity found.
              </p>
            </div>
          )}
          
          <Button variant="outline" className="mt-6 border-divider h-8 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-muted/50 transition-colors">
            System Logs
          </Button>
        </div>
      </div>
    </div>
  );
}
