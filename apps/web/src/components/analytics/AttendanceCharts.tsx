'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend 
} from 'recharts';
import { AttendanceStats } from '@epms/shared';

export default function AttendanceCharts({ stats }: { stats: AttendanceStats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Attendance Trends (Last 30 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.trends}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 12}}
                tickFormatter={(val) => val.split('-').slice(1).join('/')}
              />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Key Metrics</h3>
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">Avg Work Time</p>
            <p className="text-2xl font-black text-blue-900">{Math.round(stats.avgWorkMinutes / 60)}h {stats.avgWorkMinutes % 60}m</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <p className="text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">Late Logins</p>
            <p className="text-2xl font-black text-orange-900">{stats.lateLoginCount}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <p className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">Total Present</p>
            <p className="text-2xl font-black text-green-900">{stats.totalPresent}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <p className="text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">Break Pattern</p>
             <p className="text-2xl font-black text-purple-900">Normal</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { AreaChart, Area } from 'recharts';
