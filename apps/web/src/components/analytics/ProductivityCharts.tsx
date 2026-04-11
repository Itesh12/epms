'use client';

import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { ProductivityStats } from '@epms/shared';
import { useTranslations } from 'next-intl';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function ProductivityCharts({ stats }: { stats: ProductivityStats }) {
  const t = useTranslations('Analytics');
  const chartData = stats.workloadDistribution.map(d => ({
    name: d.userName,
    value: d.taskCount
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">{t('workloadDistribution')}</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
        <div className="text-center space-y-4">
           <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-blue-50 relative">
             <span className="text-4xl font-black text-blue-600">{stats.overallScore}%</span>
             <svg className="absolute inset-0 w-full h-full -rotate-90">
               <circle 
                 cx="64" cy="64" r="56" fill="none" 
                 stroke="#3b82f6" strokeWidth="8" 
                 strokeDasharray={351.8} 
                 strokeDashoffset={351.8 * (1 - stats.overallScore/100)} 
                 strokeLinecap="round"
               />
             </svg>
           </div>
           <h4 className="text-xl font-bold text-gray-900">{t('productivityScore')}</h4>
           <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-gray-50 rounded-xl">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('completed')}</p>
                 <p className="text-xl font-bold text-gray-800">{stats.tasksCompleted}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('avgTimePerTask')}</p>
                 <p className="text-xl font-bold text-gray-800">{t('hoursPerTask', { hours: stats.avgCompletionTime })}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
