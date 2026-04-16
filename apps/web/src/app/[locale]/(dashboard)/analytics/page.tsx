'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getAttendanceAnalytics,
  getProductivityAnalytics,
  getProjectPerformance,
  getInsights
} from '@/services/analytics';
import dynamic from 'next/dynamic';
import { BarChart2, TrendingUp, Info, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const AttendanceCharts = dynamic(() => import('@/components/analytics/AttendanceCharts'), {
  loading: () => <div className="h-[400px] bg-gray-50 animate-pulse rounded-2xl" />,
  ssr: false
});

const ProductivityCharts = dynamic(() => import('@/components/analytics/ProductivityCharts'), {
  loading: () => <div className="h-[400px] bg-gray-50 animate-pulse rounded-2xl" />,
  ssr: false
});

const InsightCards = dynamic(() => import('@/components/analytics/InsightCards'), {
  loading: () => <div className="h-40 bg-gray-50 animate-pulse rounded-2xl" />,
  ssr: false
});


export default function AnalyticsDashboard() {
  const t = useTranslations('Analytics');
  const commonT = useTranslations('Common');

  const { data: attendance, isLoading: attendanceL } = useQuery({
    queryKey: ['analytics-attendance'],
    queryFn: getAttendanceAnalytics
  });

  const { data: productivity, isLoading: productivityL } = useQuery({
    queryKey: ['analytics-productivity'],
    queryFn: getProductivityAnalytics
  });

  const { data: projects, isLoading: projectsL } = useQuery({
    queryKey: ['analytics-projects'],
    queryFn: getProjectPerformance
  });

  const { data: insights = [], isLoading: insightsL } = useQuery({
    queryKey: ['analytics-insights'],
    queryFn: getInsights
  });

  const isLoading = attendanceL || productivityL || projectsL || insightsL;

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="h-40 bg-white/50 backdrop-blur-md rounded-[2.5rem] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/50 rounded-3xl animate-pulse" />)}
        </div>
        <div className="h-[500px] bg-white/50 rounded-[3rem] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-12 px-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/40 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/40 shadow-2xl shadow-gray-200/30 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <span className="p-4 bg-gray-900 text-white rounded-[1.5rem] shadow-2xl shadow-gray-900/20 translate-y-[-2px]">
                <BarChart2 size={32} />
              </span>
              <div className="h-px w-12 bg-gray-200" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{t('intelligentAnalytics')}</span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter transition-all">
              {t('title')}
            </h1>
            <p className="text-gray-500 mt-4 text-xl font-medium max-w-lg leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          <div className="flex flex-col items-end gap-6 relative z-10">
            <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-white shadow-xl flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse outline outline-4 outline-emerald-500/20" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('systemStatus')}</p>
                <p className="font-black text-gray-900 text-sm uppercase">{t('operational')}</p>
              </div>
            </div>
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-12 h-12 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-blue-${i}00 to-indigo-${i + 1}00`} />
              ))}
              <div className="w-12 h-12 rounded-2xl border-4 border-white shadow-lg bg-gray-900 flex items-center justify-center text-[10px] font-black text-white">+12</div>
            </div>
          </div>
        </header>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPIBox label="Enterprise Focus" value="94.2%" trend="+2.4%" color="blue" />
          <KPIBox label="Avg. Velocity" value="8.4" sub="pts/day" trend="+12%" color="purple" />
          <KPIBox label="Risk Level" value="Minimal" sub="Safe" trend="0%" color="emerald" />
          <KPIBox label="Active Projects" value={projects?.length || 0} trend="Live" color="orange" />
        </div>

        {/* Intelligence Layer */}
        <section className="space-y-8">
          <SectionHeader icon={<Info className="text-blue-500" />} title={t('patternTracking')} />
          <InsightCards insights={insights} />
        </section>

        {/* Data Visualization Grid */}
        <div className="grid grid-cols-1 gap-12">
          {attendance && <AttendanceCharts stats={attendance} />}
          {productivity && <ProductivityCharts stats={productivity} />}
        </div>

        {/* Strategic Performance */}
        <section className="space-y-8 pb-10">
          <SectionHeader icon={<TrendingUp className="text-blue-500" />} title={t('projectPerformance')} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects?.map((project: any, idx: number) => (
              <ProjectNodeCard key={project.projectId} project={project} index={idx} t={t} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function KPIBox({ label, value, trend, color, sub }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-xl flex flex-col justify-between group overflow-hidden relative"
    >
      <div className={`absolute top-0 right-0 w-16 h-16 bg-${color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform`} />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] relative z-10">{label}</p>
      <div className="flex items-baseline gap-2 mt-4 relative z-10">
        <h4 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h4>
        {sub && <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{sub}</span>}
      </div>
      <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border border-${color}-100 bg-${color}-50/50 text-${color}-600 self-start relative z-10`}>
        {trend}
      </div>
    </motion.div>
  );
}

function SectionHeader({ icon, title }: any) {
  return (
    <div className="flex items-center gap-4 px-2">
      <span className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/5 border border-white">
        {icon}
      </span>
      <h2 className="text-2xl font-black text-gray-900 tracking-tight lowercase first-letter:uppercase">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-4" />
    </div>
  );
}

function ProjectNodeCard({ project, index, t }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/30 border border-white flex flex-col group"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <h3 className="text-xl font-black text-gray-900 truncate max-w-[200px] tracking-tight">{project.projectName}</h3>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${project.isOnTrack ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
            {project.isOnTrack ? t('onTrack') : t('delayPredicted')}
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{project.progress}%</p>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{t('progress')}</p>
        </div>
      </div>

      <div className="w-full h-4 bg-gray-100/50 rounded-2xl overflow-hidden mb-8 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${project.progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full rounded-2xl shadow-lg ${project.isOnTrack ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-rose-500 to-orange-500'}`}
        />
      </div>

      <div className="mt-auto flex justify-between items-center bg-white/60 p-4 rounded-3xl border border-white">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className={project.predictedDelayDays > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-200'} />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            {t('delayPrediction', { days: project.predictedDelayDays })}
          </span>
        </div>
        <button className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center hover:scale-110 transition-transform">
          <ArrowUpRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}
