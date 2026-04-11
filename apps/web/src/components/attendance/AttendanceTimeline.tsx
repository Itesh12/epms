'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Coffee, Briefcase, Info } from 'lucide-react';
import { useAttendance } from '@/contexts/AttendanceContext';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

export default function AttendanceTimeline() {
  const { attendance, isLoading } = useAttendance();
  const t = useTranslations('Attendance');

  if (isLoading || !attendance || attendance.activities.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
          <Info size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{t('timelineUnavailable')}</h3>
        <p className="text-sm text-gray-500 max-w-xs font-medium">{t('timelineHint')}</p>
      </div>
    );
  }

  const startTime = new Date(attendance.activities[0].startTime).getTime();
  const endTime = attendance.checkOutTime 
    ? new Date(attendance.checkOutTime).getTime() 
    : Math.max(Date.now(), startTime + 3600000); // Show at least 1hr
  const totalDuration = endTime - startTime;

  const getActivityWidth = (activity: any) => {
    const start = new Date(activity.startTime).getTime();
    const end = activity.endTime ? new Date(activity.endTime).getTime() : Date.now();
    return `${((end - start) / totalDuration) * 100}%`;
  };

  const getActivityLeft = (activity: any) => {
    const start = new Date(activity.startTime).getTime();
    return `${((start - startTime) / totalDuration) * 100}%`;
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
          <Clock className="text-blue-600" />
          {t('timeline.title')}
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">{t('timeline.work')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">{t('timeline.break')}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-12 bg-gray-100 rounded-2xl overflow-hidden mb-12 flex">
        {attendance.activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            className={`h-full relative transition-all border-r border-white/20 ${
              activity.type === 'WORK' ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-orange-500 shadow-lg shadow-orange-100'
            }`}
            style={{ 
              width: getActivityWidth(activity),
              transformOrigin: 'left'
            }}
          >
            {!activity.endTime && (
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-white/20" 
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Segment List */}
      <div className="space-y-4">
        {attendance.activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-6 p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-blue-100 transition-all group">
            <div className={`p-3 rounded-xl ${
              activity.type === 'WORK' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'
            }`}>
              {activity.type === 'WORK' ? <Briefcase size={20} /> : <Coffee size={20} />}
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-black text-gray-900 underline decoration-blue-100 decoration-2 underline-offset-4">
                {activity.type === 'WORK' ? t('timeline.activeSession') : t('timeline.breakSession')}
              </p>
              <p className="text-xs text-gray-400 font-bold uppercase mt-1">
                {format(new Date(activity.startTime), 'hh:mm a')} — {activity.endTime ? format(new Date(activity.endTime), 'hh:mm a') : t('timeline.activeNow')}
              </p>
            </div>

            <div className="text-right">
              <span className="text-sm font-black text-gray-900 tracking-tight">
                {activity.endTime 
                  ? `${Math.round((new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) / 60000)}m`
                  : t('timeline.ongoing')
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
