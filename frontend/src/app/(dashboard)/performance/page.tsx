'use client';

import { useEffect, useState } from 'react';
import {
  Trophy, TrendingUp, Clock, Target,
  Loader2, ArrowUpRight, ArrowDownRight, Award,
  Activity, Zap, ShieldCheck
} from 'lucide-react';
import api from '@/services/api';
import { cn } from '@/lib/utils';

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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
          <span className="text-sm font-black uppercase tracking-widest text-muted-foreground/50">Analyzing Workforce...</span>
        </div>
      </div>
    );
  }

  const teamEfficiency = performance.length > 0
    ? Math.round(performance.reduce((acc, curr) => acc + (curr.efficiency || 0), 0) / performance.length)
    : 0;

  const teamPunctuality = performance.length > 0
    ? Math.round(performance.reduce((acc, curr) => acc + (curr.punctuality || 0), 0) / performance.length)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 max-w-[1400px]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Award size={14} className="text-primary" />
            </div>
            <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Efficiency Protocol</span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight leading-tight">
            Performance Insights
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed">
            Real-time analytics of team productivity, task saturation, and operational velocity.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-muted/60 p-1.5 rounded-2xl border border-divider shadow-sm">
          <div className="flex flex-col items-end px-4">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Global Status</span>
            <span className="text-xs font-black text-emerald-500 uppercase tracking-tighter">OPTIMIZED</span>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/10">
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Elite Performer Card */}
        <div className="lg:col-span-2 relative group">
          <div className="absolute inset-0 bg-primary/20 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity rounded-full -z-10" />
          <div className="bg-primary rounded-[32px] p-8 text-primary-foreground shadow-2xl shadow-primary/20 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest border border-white/10 inline-block backdrop-blur-md">Elite Performer</span>
                <Zap size={14} className="text-white/60" />
              </div>
              <h2 className="text-3xl font-black mt-4 break-all tracking-tight leading-[0.9] group-hover:translate-x-1 transition-transform cursor-default">
                {performance[0]?.email.split('@')[0] || 'Unassigned'}
              </h2>
            </div>

            <div className="flex items-end justify-between relative z-10 mt-6">
              <div className="flex gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">Efficiency Rank</p>
                  <p className="text-4xl font-black leading-none tabular-nums">{Math.round(performance[0]?.efficiency || 0)}%</p>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-8">
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">Punctuality</p>
                  <p className="text-4xl font-black leading-none tabular-nums">{Math.round(performance[0]?.punctuality || 0)}%</p>
                </div>
              </div>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group-hover:rotate-6 transition-all duration-500">
                <Trophy size={28} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary KPIs */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div className="bg-card border border-divider rounded-[32px] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all hover:border-primary/20 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                  <ShieldCheck size={18} />
                </div>
                <ArrowUpRight size={18} className="text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <p className="font-black text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 leading-none">Team Efficiency</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-foreground leading-none tabular-nums">{teamEfficiency}%</p>
                  <span className="text-[10px] font-black text-emerald-500 uppercase pb-1 tracking-widest">+4.2%</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-divider rounded-[32px] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all hover:border-primary/20 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                  <Clock size={18} />
                </div>
                <Activity size={18} className="text-blue-500 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <p className="font-black text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 leading-none">Net Punctuality</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-foreground leading-none tabular-nums">{teamPunctuality}%</p>
                  <span className="text-[10px] font-black text-blue-500 uppercase pb-1 tracking-widest">STABLE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Workforce Matrix */}
      <div className="bg-card border border-divider rounded-[32px] overflow-hidden shadow-2xl shadow-black/5 relative">
        <div className="px-8 py-6 border-b border-divider flex items-center justify-between bg-muted/20">
          <div className="space-y-1">
            <h3 className="font-black text-[12px] uppercase tracking-[0.3em] text-foreground">Workforce Matrix</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Employee Saturation & Velocity Index</p>
          </div>
          <TrendingUp size={18} className="text-primary/40" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 border-b border-divider">
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                <th className="px-8 py-4">Ranking Order</th>
                <th className="px-8 py-4 text-center">Completed Scope</th>
                <th className="px-8 py-4 text-center">Efficiency Score</th>
                <th className="px-8 py-4 text-center">Punctuality Score</th>
                <th className="px-8 py-4 text-right">Momentum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider font-medium">
              {performance.map((member, index) => (
                <tr key={member.email} className="group hover:bg-muted/10 transition-colors border-b border-divider last:border-0">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all",
                        index === 0
                          ? 'bg-amber-400 text-white shadow-xl shadow-amber-400/30'
                          : 'bg-muted text-muted-foreground border border-divider group-hover:border-primary/30 group-hover:text-primary'
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-foreground leading-tight tracking-tight">{member.email.split('@')[0]}</p>
                        <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest leading-none mt-1">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-xs font-black text-foreground px-3 py-1 bg-muted/50 rounded-lg border border-divider tabular-nums">
                      {member.totalCompleted}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className={cn(
                        "text-xs font-black tabular-nums",
                        member.efficiency >= 100 ? 'text-emerald-500' : 'text-amber-500'
                      )}>
                        {Math.round(member.efficiency)}%
                      </span>
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-1000",
                            member.efficiency >= 100 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          )}
                          style={{ width: `${Math.min(member.efficiency, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center font-black text-xs text-foreground/90 tabular-nums">
                    {Math.round(member.punctuality)}%
                  </td>
                  <td className="px-8 py-5 text-right pr-10">
                    <div className={cn(
                      "inline-flex p-1.5 rounded-lg border",
                      member.efficiency >= 100 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    )}>
                      {member.efficiency >= 100 ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownRight size={16} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {performance.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Activity size={48} />
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Calibration Required: No workforce data</p>
                    </div>
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

