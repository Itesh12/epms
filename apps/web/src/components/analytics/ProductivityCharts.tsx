'use client';

import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { ProductivityStats } from '@epms/shared';
import { useTranslations } from 'next-intl';
import { Target, CheckCircle2, Timer, Zap } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function ProductivityCharts({ stats }: { stats: ProductivityStats }) {
  const t = useTranslations('Analytics');
  const chartData = stats.workloadDistribution.map(d => ({
    name: d.userName,
    value: d.taskCount
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl shadow-gray-200/40">
        <div className="mb-8">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">{t('workloadDistribution')}</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Resource Utilization</p>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none" 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(val) => <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl shadow-gray-200/40 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="text-center space-y-8 relative z-10 w-full">
           <div className="relative inline-flex items-center justify-center w-40 h-40">
             <div className="absolute inset-0 rounded-full border-[10px] border-gray-100" />
             <svg className="absolute inset-0 w-full h-full -rotate-90">
               <circle 
                 cx="80" cy="80" r="75" fill="none" 
                 stroke="url(#productivityGradient)" strokeWidth="10" 
                 strokeDasharray={471.2} 
                 strokeDashoffset={471.2 * (1 - stats.overallScore/100)} 
                 strokeLinecap="round"
                 className="transition-all duration-1000 ease-out"
               />
               <defs>
                 <linearGradient id="productivityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#3b82f6" />
                   <stop offset="100%" stopColor="#8b5cf6" />
                 </linearGradient>
               </defs>
             </svg>
             <div className="flex flex-col items-center">
               <span className="text-5xl font-black text-gray-900 tracking-tighter">{stats.overallScore}%</span>
               <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t('score')}</span>
             </div>
           </div>

           <div className="space-y-2">
             <h4 className="text-2xl font-black text-gray-900 tracking-tight">{t('productivityScore')}</h4>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Current Enterprise Velocity</p>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-8 w-full">
              <div className="p-6 bg-white/40 border border-white rounded-[2rem] shadow-inner-lg">
                 <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                   <CheckCircle2 size={18} />
                 </div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('completed')}</p>
                 <p className="text-2xl font-black text-gray-900">{stats.tasksCompleted}</p>
              </div>
              <div className="p-6 bg-white/40 border border-white rounded-[2rem] shadow-inner-lg">
                 <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3">
                   <Timer size={18} />
                 </div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('avgTime')}</p>
                 <p className="text-2xl font-black text-gray-900">{stats.avgCompletionTime}<span className="text-xs">h</span></p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
