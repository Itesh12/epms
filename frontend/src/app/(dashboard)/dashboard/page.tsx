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
    <div className="astra-card astra-glass p-8 rounded-3xl group">
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${colorMap[color]}`}>
          {icon}
        </div>
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-4xl font-black text-foreground tracking-tighter">{value}</h2>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary/40 rounded-full w-2/3" />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground italic whitespace-nowrap">{trend}</span>
      </div>
    </div>
  );
}

function ActivityItem({ text, time }: { text: string, time: string }) {
  return (
    <div className="flex gap-4 pb-6 border-b border-border/50 last:border-none last:pb-0 group relative">
      <div className="relative">
        <div className="w-3 h-3 rounded-full bg-primary/20 mt-1.5 shrink-0 group-hover:bg-primary transition-all duration-300 z-10 relative" />
        <div className="absolute top-4 bottom-0 left-[5.5px] w-[1px] bg-border group-last:hidden" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed">{text}</p>
        <p className="text-[11px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-wider">{time}</p>
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
    <div className="space-y-12 animate-in fade-in duration-700 max-w-[1400px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
             <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Astra Intelligence</span>
          </div>
          <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">
            Welcome, <span className="text-primary">{user?.email.split('@')[0]}</span>
          </h1>
          <p className="text-muted-foreground font-bold text-lg max-w-xl leading-relaxed">
            Your organization is operating at <span className="text-foreground">94% efficiency</span> today. Here are the key pulses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Talent Pool" 
          value={stats?.totalEmployees || '0'} 
          icon={<Users size={24} strokeWidth={2.5} />} 
          trend="+2 this week"
          color="blue"
        />
        <StatCard 
          title="Active Portfolios" 
          value={stats?.totalProjects || '0'} 
          icon={<Briefcase size={24} strokeWidth={2.5} />} 
          trend="4 high priority"
          color="indigo"
        />
        <StatCard 
          title="Success Deliveries" 
          value={stats?.projectDistribution?.DONE || '0'} 
          icon={<CheckCircle2 size={24} strokeWidth={2.5} />} 
          trend="98% on target"
          color="emerald"
        />
        <StatCard 
          title="Velocity" 
          value={stats?.projectDistribution?.IN_PROGRESS || '0'} 
          icon={<Clock size={24} strokeWidth={2.5} />} 
          trend="Normal load"
          color="amber"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 astra-card astra-glass rounded-3xl p-8 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">System Dynamics</h3>
              <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">Velocity Stream Analysis</p>
            </div>
            <div className="flex gap-2">
               <div className="px-3 py-1.5 bg-muted/50 rounded-lg text-[10px] font-black text-muted-foreground tracking-widest border border-border">MTD</div>
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
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '1.25rem',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: 'var(--foreground)', fontWeight: 800, fontSize: '14px' }}
                  labelStyle={{ color: 'var(--muted-foreground)', fontWeight: 700, fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' }}
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

        <div className="astra-card astra-glass rounded-3xl p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-foreground tracking-tight">Organization Pulse</h3>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
          </div>
          
          {stats?.recentActivity?.length > 0 ? (
            <div className="space-y-6 flex-1">
              {stats.recentActivity.map((act: any, idx: number) => (
                <ActivityItem key={idx} text={act.text} time={act.time} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full space-y-4 opacity-40">
              <div className="w-16 h-16 rounded-3xl bg-muted/40 flex items-center justify-center">
                <Clock size={32} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-4">
                No signal detected in the organization stream.
              </p>
            </div>
          )}
          
          <Button variant="outline" size="sm" className="mt-8 border-dashed">
            View System Logs
          </Button>
        </div>
      </div>
    </div>
  );
}
