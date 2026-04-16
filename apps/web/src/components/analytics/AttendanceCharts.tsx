import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AttendanceStats } from '@epms/shared';
import { useTranslations } from 'next-intl';
import { Clock, UserCheck, AlertOctagon, Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl border-l-4 border-l-blue-500">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-gray-900">{payload[0].value} <span className="text-xs font-bold text-gray-400">Users</span></p>
      </div>
    );
  }
  return null;
};

export default function AttendanceCharts({ stats }: { stats: AttendanceStats }) {
  const t = useTranslations('Analytics');
  
  const metricItems = [
    { 
      label: t('avgWorkTime'), 
      value: `${Math.round(stats.avgWorkMinutes / 60)}h ${stats.avgWorkMinutes % 60}m`,
      icon: <Clock size={16} />,
      color: 'blue'
    },
    { 
      label: t('lateLogins'), 
      value: stats.lateLoginCount,
      icon: <AlertOctagon size={16} />,
      color: 'orange'
    },
    { 
      label: t('totalPresent'), 
      value: stats.totalPresent,
      icon: <UserCheck size={16} />,
      color: 'emerald'
    },
    { 
      label: t('breakPattern'), 
      value: t('normal'),
      icon: <Activity size={16} />,
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl shadow-gray-200/40">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">{t('attendanceTrends', { days: 30 })}</h3>
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">Activity over time</p>
          </div>
          <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-blue-500" />
             <div className="w-3 h-3 rounded-full bg-blue-200" />
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.trends}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}}
                tickFormatter={(val) => val.split('-').slice(1).join('/')}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} 
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorCount)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl shadow-gray-200/40 flex flex-col">
        <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">{t('keyMetrics')}</h3>
        <div className="grid grid-cols-1 gap-4 flex-1">
          {metricItems.map((item, i) => (
            <div key={i} className={`p-5 rounded-3xl border border-white bg-white/40 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${item.color}-50 text-${item.color}-600 shadow-inner`}>
                {item.icon}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                <p className="text-lg font-black text-gray-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

