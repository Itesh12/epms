'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Briefcase, BarChart3 } from 'lucide-react';
import AttendanceHub from '@/components/attendance/AttendanceHub';
import AttendanceTimeline from '@/components/attendance/AttendanceTimeline';
import AttendanceHeatmap from '@/components/attendance/AttendanceHeatmap';
import { useTranslations } from 'next-intl';
import api from '@/services/api';

const StatCard = ({ label, value, icon: Icon, color, loading }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-gray-100`}>
        <Icon size={20} />
      </div>
      {!loading && <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+0%</span>}
    </div>
    <h3 className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider text-[10px] font-black">{label}</h3>
    {loading ? (
      <div className="h-8 w-24 bg-gray-50 animate-pulse rounded-lg" />
    ) : (
      <p className="text-3xl font-black text-gray-900">{value}</p>
    )}
  </div>
);

export default function AdminDashboard() {
  const t = useTranslations('Dashboard.admin');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const { data } = await api.get('/analytics/overview');
        setData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard overview:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('title')}</h1>
        <p className="text-sm text-gray-500 font-medium">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label={t('totalOrgs')} 
          value={data?.totalOrganizations} 
          icon={Building2} 
          color="bg-blue-600" 
          loading={loading}
        />
        <StatCard 
          label={t('activeEmployees')} 
          value={data?.activeEmployees} 
          icon={Users} 
          color="bg-purple-600" 
          loading={loading}
        />
        <StatCard 
          label={t('totalProjects')} 
          value={data?.totalProjects} 
          icon={Briefcase} 
          color="bg-indigo-600" 
          loading={loading}
        />
        <StatCard 
          label={t('completionRate')} 
          value={`${data?.completionRate}%`} 
          icon={BarChart3} 
          color="bg-emerald-600" 
          loading={loading}
        />
      </div>

      <div className="space-y-8 mt-12 pt-12 border-t border-gray-100">
        <AttendanceHub />
        <AttendanceTimeline />
        <AttendanceHeatmap />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <BarChart3 size={32} />
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('chartPlaceholder')}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <Users size={32} />
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('topRegions')}</p>
        </div>
      </div>
    </div>
  );
}
