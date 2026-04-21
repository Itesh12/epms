'use client';

import { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { Loader2, PieChart as PieChartIcon } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    async function fetchAnalytics() {
      try {
        const res = await api.get('/analytics/overview');
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasVelocityData = data?.monthlyVelocity?.some((v: any) => v.projects > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-6">
      <div>
        <h1 className="text-xl font-black text-foreground uppercase tracking-widest flex items-center gap-2.5">
          <PieChartIcon className="text-primary" size={20} />
          Analytics Deep Dive
        </h1>
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
          Activity metrics and team performance breakdown.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Completion Ratio */}
        <div className="bg-card border border-divider rounded-2xl p-4 shadow-sm flex flex-col items-center">
          <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground w-full mb-4">Project Completion Ratio</h3>
          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              {data?.statusRatio?.length > 0 ? (
                <PieChart>
                  <Pie
                    data={data.statusRatio}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.statusRatio.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      borderColor: 'var(--divider)', 
                      backgroundColor: 'var(--card)', 
                      color: 'var(--foreground)', 
                      fontSize: '10px' 
                    }}
                    itemStyle={{ color: 'var(--foreground)', fontWeight: 900 }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)' }}/>
                </PieChart>
              ) : (
                <EmptyState message="No projects recorded yet." />
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-card border border-divider rounded-2xl p-4 shadow-sm flex flex-col items-center">
          <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground w-full mb-4">Role Distribution</h3>
          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
               {data?.roleDistribution?.length > 0 ? (
                  <BarChart data={data.roleDistribution} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" />
                    <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: 'var(--foreground)', fontWeight: 'black' }} axisLine={false} tickLine={false} width={80} />
                    <RechartsTooltip 
                      cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        borderColor: 'var(--divider)', 
                        backgroundColor: 'var(--card)', 
                        color: 'var(--foreground)', 
                        fontSize: '10px' 
                      }}
                      itemStyle={{ color: 'var(--foreground)', fontWeight: 900 }}
                    />
                    <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 4, 4, 0]} maxBarSize={40}>
                       {data.roleDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Bar>
                  </BarChart>
               ) : (
                 <EmptyState message="No employees recorded." />
               )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Activity Chart */}
      <div className="bg-card border border-divider rounded-2xl p-4 shadow-sm">
        <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground mb-6">Monthly Project Progress</h3>
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.monthlyVelocity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9, fontWeight: 'black' }} 
                dy={10}
                minTickGap={20}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9, fontWeight: 'black' }}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  borderColor: 'var(--divider)', 
                  borderRadius: '12px', 
                  fontSize: '10px' 
                }}
                itemStyle={{ color: 'var(--foreground)', fontWeight: 900 }}
                labelStyle={{ color: 'var(--muted-foreground)', fontWeight: 900, textTransform: 'uppercase' }}
              />
              <Area 
                type="monotone" 
                dataKey="projects" 
                stroke="var(--color-primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorProjects)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center border border-dashed border-divider rounded-xl">
      <p className="text-muted-foreground/30 font-black text-[9px] uppercase tracking-widest leading-none">{message}</p>
    </div>
  );
}
