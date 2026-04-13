'use client';

import React from 'react';
import { Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import AttendanceHub from '@/components/attendance/AttendanceHub';
import AttendanceTimeline from '@/components/attendance/AttendanceTimeline';
import AttendanceHeatmap from '@/components/attendance/AttendanceHeatmap';
import { useTranslations } from 'next-intl';

const TeamStat = ({ label, value, subtext, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6">
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
      <Icon size={28} />
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-xs text-blue-600 font-medium mt-1">{subtext}</p>
    </div>
  </div>
);

export default function ManagerDashboard() {
  const t = useTranslations('Dashboard.manager');
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500">{t('subtitle')}</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          {t('teamReport')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TeamStat label={t('activeNow')} value="18" subtext={t('attendanceRate', { rate: 92 })} icon={Users} color="bg-blue-600" />
        <TeamStat label={t('pendingApprovals')} value="4" subtext={t('requestCount', { count: 2 })} icon={Clock} color="bg-orange-500" />
        <TeamStat label={t('weeklyProgress')} value="76%" subtext={t('growth', { rate: 5 })} icon={CheckCircle2} color="bg-green-600" />
      </div>

      <div className="space-y-8 mt-12 pt-12 border-t border-gray-100">
        <AttendanceHub />
        <AttendanceTimeline />
        <AttendanceHeatmap />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <AlertCircle className="text-orange-500" />
          <h3 className="font-bold text-gray-900">{t('anomalies')}</h3>
        </div>
        <div className="text-center py-12 text-gray-400 font-medium">
          {t('noAnomalies')}
        </div>
      </div>
    </div>
  );
}
