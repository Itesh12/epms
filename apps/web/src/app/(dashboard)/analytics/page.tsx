'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getAttendanceAnalytics, 
  getProductivityAnalytics, 
  getProjectPerformance, 
  getInsights 
} from '@/services/analytics';
import AttendanceCharts from '@/components/analytics/AttendanceCharts';
import ProductivityCharts from '@/components/analytics/ProductivityCharts';
import InsightCards from '@/components/analytics/InsightCards';
import { BarChart2, TrendingUp, Info, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard() {
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
        <div className="h-32 bg-gray-100 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="h-40 bg-gray-50 rounded-2xl animate-pulse" />
           <div className="h-40 bg-gray-50 rounded-2xl animate-pulse" />
           <div className="h-40 bg-gray-50 rounded-2xl animate-pulse" />
        </div>
        <div className="h-[400px] bg-gray-50 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <span className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200"><BarChart2 size={28} /></span>
            Intelligent Analytics
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Cross-module insights and performance pattern tracking.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="font-bold text-gray-900">SYSTEM HEALTHY</span>
            </div>
          </div>
        </div>
      </header>

      {/* Pattern Tracking (Insights) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
           <Info className="text-blue-500" size={20} />
           <h2 className="text-xl font-bold text-gray-900">Pattern Tracking</h2>
        </div>
        <InsightCards insights={insights} />
      </section>

      {/* Top Level Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {attendance && <AttendanceCharts stats={attendance} />}
        {productivity && <ProductivityCharts stats={productivity} />}
      </div>

      {/* Project Performance Metrics */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
           <TrendingUp className="text-blue-500" size={20} />
           <h2 className="text-xl font-bold text-gray-900">Project Performance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project: any) => (
            <motion.div 
               whileHover={{ y: -5 }}
               key={project.projectId} 
               className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
            >
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="font-bold text-gray-900 truncate max-w-[150px]">{project.projectName}</h3>
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${project.isOnTrack ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                     {project.isOnTrack ? 'ON TRACK' : 'DELAY PREDICTED'}
                   </span>
                 </div>
                 <div className="text-right">
                   <p className="text-2xl font-black text-gray-900">{project.progress}%</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Progress</p>
                 </div>
               </div>

               <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden mb-6">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    className={`h-full ${project.isOnTrack ? 'bg-blue-600' : 'bg-red-500'}`}
                 />
               </div>

               <div className="flex justify-between items-center text-xs font-bold">
                 <div className="flex items-center gap-1.5 text-gray-500">
                   <AlertTriangle size={14} className={project.predictedDelayDays > 0 ? 'text-orange-500' : 'text-gray-200'}/>
                   {project.predictedDelayDays}D DELAY PREDICTION
                 </div>
                 <button className="text-blue-600 hover:underline">DETAILS</button>
               </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
