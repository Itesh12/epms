'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, PieChart, TrendingUp } from 'lucide-react';
import AttendanceHub from '@/components/attendance/AttendanceHub';
import AttendanceTimeline from '@/components/attendance/AttendanceTimeline';
import AttendanceHeatmap from '@/components/attendance/AttendanceHeatmap';
import { useTranslations } from 'next-intl';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} text-white`}>
        <Icon size={20} />
      </div>
      <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+12%</span>
    </div>
    <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export default function AdminDashboard() {
  const t = useTranslations('Dashboard.admin');
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t('totalOrgs')} value="1" icon={Building2} color="bg-blue-600" />
        <StatCard label={t('activeEmployees')} value="128" icon={Users} color="bg-purple-600" />
        <StatCard label={t('monthlyRevenue')} value="$42,500" icon={PieChart} color="bg-orange-600" />
        <StatCard label={t('growthRate')} value="24%" icon={TrendingUp} color="bg-green-600" />
      </div>

      <div className="space-y-8 mt-12 pt-12 border-t border-gray-100">
        <AttendanceHub />
        <AttendanceTimeline />
        <AttendanceHeatmap />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center text-gray-400 font-medium">
          {t('chartPlaceholder')}
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center text-gray-400 font-medium">
          {t('topRegions')}
        </div>
      </div>
    </div>
  );
}
