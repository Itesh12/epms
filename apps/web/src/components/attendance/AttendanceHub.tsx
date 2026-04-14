'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Play, Coffee, LogOut, CheckCircle2, Edit3 } from 'lucide-react';
import { useAttendance } from '@/contexts/AttendanceContext';
import { toast } from 'sonner';
import CorrectionRequestModal from './CorrectionRequestModal';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

export default function AttendanceHub() {
  const { attendance, checkIn, checkOut, toggleBreak, isLoading } = useAttendance();
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const t = useTranslations('Attendance');
  const commonT = useTranslations('Common');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const lastActivity = attendance?.activities?.find((a: any) => !a.endTime);
    if (lastActivity) {
      const startTime = new Date(lastActivity.startTime).getTime();
      interval = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setSessionTime(0);
    }
    return () => clearInterval(interval);
  }, [attendance]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCheckIn = async () => {
    try {
      await checkIn();
      toast.success(t('messages.shiftStarted'));
    } catch (e: any) {
      // toast already shown in context
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
      toast.success(t('messages.shiftEnded'));
    } catch (e: any) {
      // toast already shown in context
    }
  };

  const handleToggleBreak = async () => {
    try {
      await toggleBreak();
      const isOnBreak = attendance?.status === 'PRESENT';
      toast.success(isOnBreak ? t('messages.breakStarted') : t('messages.welcomeBack'));
    } catch (e: any) {
      // toast already shown in context
    }
  };

  if (isLoading) return <div className="h-64 bg-gray-50 animate-pulse rounded-3xl" />;

  const hasCheckedOut = !!attendance?.checkOutTime;
  const isActive = !!attendance?.activities?.find((a: any) => !a.endTime);
  const status = attendance?.status || 'NOT_STARTED';
  const isOnBreak = status === 'ON_BREAK';
  const hasSession = !!attendance && !hasCheckedOut;

  // Compute work/break from activities as ground truth
  // (covers short sessions where Math.floor rounds to 0)
  const computeMinutesFromActivities = (type: 'WORK' | 'BREAK') => {
    if (!attendance?.activities) return 0;
    return attendance.activities.reduce((acc: number, act: any) => {
      if (act.type !== type) return acc;
      const end = act.endTime ? new Date(act.endTime) : new Date();
      const start = new Date(act.startTime);
      return acc + (end.getTime() - start.getTime()) / 1000 / 60;
    }, 0);
  };

  const storedWorkMins = attendance?.totalWorkMinutes || 0;
  const storedBreakMins = attendance?.totalBreakMinutes || 0;

  // If session is completed but stored=0, recalculate from activities
  const computedWorkMins = hasCheckedOut && storedWorkMins === 0
    ? Math.max(1, Math.floor(computeMinutesFromActivities('WORK')))
    : storedWorkMins;
  const computedBreakMins = hasCheckedOut && storedBreakMins === 0
    ? Math.floor(computeMinutesFromActivities('BREAK'))
    : storedBreakMins;

  const todayWorkMins = hasCheckedOut ? computedWorkMins : Math.floor(sessionTime / 60) + storedWorkMins;
  const todayBreakMins = isOnBreak
    ? Math.floor(sessionTime / 60) + storedBreakMins
    : computedBreakMins;

  const totalSessionMins = todayWorkMins + todayBreakMins;
  const efficiencyPct = totalSessionMins > 0
    ? Math.round(todayWorkMins / totalSessionMins * 100)
    : 0;

  return (
    <div className={`bg-white rounded-[2.5rem] p-8 shadow-xl border overflow-hidden relative transition-all duration-500 ${
      isOnBreak ? 'border-orange-100 shadow-orange-100/50' :
      hasCheckedOut ? 'border-green-100 shadow-green-100/50' :
      hasSession ? 'border-blue-50/50 shadow-blue-100/50' : 'border-gray-100'
    }`}>
      {/* Dynamic glow */}
      <div className={`absolute top-0 right-0 w-40 h-40 blur-3xl opacity-10 rounded-full transition-colors duration-700 ${
        isOnBreak ? 'bg-orange-500' :
        hasCheckedOut ? 'bg-green-500' :
        hasSession ? 'bg-blue-500' : 'bg-gray-300'
      }`} />

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-between relative z-10">
        {/* Timer side */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
            <h2 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${
              isOnBreak ? 'text-orange-500' : hasCheckedOut ? 'text-green-600' : 'text-blue-600'
            }`}>
              <Clock size={16} />
              {hasCheckedOut ? t('status.dayComplete') : isOnBreak ? t('status.onBreak') : isActive ? t('status.liveSession') : t('status.readyToStart')}
            </h2>
            {hasSession && (
              <button
                onClick={() => setIsCorrectionOpen(true)}
                className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded hover:bg-blue-600 hover:text-white transition-all uppercase tracking-tighter"
              >
                <Edit3 size={10} className="inline mr-1" />{t('actions.requestCorrection')}
              </button>
            )}
          </div>

          {/* Clock display */}
          <span className={`text-5xl font-black tracking-tight tabular-nums ${
            hasCheckedOut ? 'text-green-600' : 'text-gray-900'
          }`}>
            {hasCheckedOut
              ? formatTime(todayWorkMins * 60)
              : formatTime(sessionTime)}
          </span>

          <p className="text-gray-400 font-bold text-sm mt-1">
            {hasCheckedOut
              ? t('status.checkedOutAt', { time: format(new Date(attendance!.checkOutTime!), 'hh:mm a') })
              : status === 'NOT_STARTED' ? t('status.notStarted') : `${t('timeline.title')}: ${commonT(`roles.${status}`)}`}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {hasCheckedOut ? (
            <div className="flex items-center gap-2 px-8 py-4 bg-green-50 text-green-700 rounded-2xl font-black border border-green-100">
              <CheckCircle2 size={20} />
              {t('actions.shiftCompleted')}
            </div>
          ) : !attendance || status === 'NOT_STARTED' ? (
            <button
              onClick={handleCheckIn}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl shadow-blue-200 active:scale-95 group"
            >
              <Play fill="currentColor" size={20} className="group-hover:translate-x-0.5 transition-transform" />
              {t('actions.startShift')}
            </button>
          ) : (
            <>
              <button
                onClick={handleToggleBreak}
                className={`px-8 py-5 rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 ${
                  isOnBreak
                    ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isOnBreak ? <Play size={20} /> : <Coffee size={20} />}
                {isOnBreak ? t('actions.resumeWork') : t('actions.takeBreak')}
              </button>
              <button
                onClick={handleCheckOut}
                className="px-8 py-5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl active:scale-95"
              >
                <LogOut size={20} />
                {t('actions.checkOut')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats row — 5 columns */}
      <div className="mt-10 grid grid-cols-2 lg:grid-cols-5 gap-4 pt-8 border-t border-gray-50">
        <div className="p-4 bg-gray-50/50 rounded-2xl">
          <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('totalWork')}</p>
          <p className="text-xl font-black text-gray-900">
            {Math.floor(todayWorkMins / 60)}h {todayWorkMins % 60}m
          </p>
        </div>
        <div className="p-4 bg-gray-50/50 rounded-2xl">
          <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('totalBreak')}</p>
          <p className="text-xl font-black text-gray-900">
            {Math.floor(todayBreakMins / 60)}h {todayBreakMins % 60}m
          </p>
        </div>
        <div className="p-4 bg-gray-50/50 rounded-2xl">
          <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('clockIn')}</p>
          <p className="text-xl font-black text-gray-900">
            {attendance?.checkInTime
              ? format(new Date(attendance.checkInTime), 'hh:mm a')
              : '--:--'}
          </p>
        </div>
        <div className="p-4 bg-gray-50/50 rounded-2xl">
          <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('clockOut')}</p>
          <p className={`text-xl font-black ${attendance?.checkOutTime ? 'text-gray-900' : 'text-gray-300'}`}>
            {attendance?.checkOutTime
              ? format(new Date(attendance.checkOutTime), 'hh:mm a')
              : '--:--'}
          </p>
        </div>
        <div className={`p-4 rounded-2xl border transition-colors ${
          efficiencyPct >= 80 ? 'bg-green-50/50 border-green-100/50' :
          efficiencyPct >= 60 ? 'bg-blue-50/50 border-blue-100/50' :
          efficiencyPct > 0 ? 'bg-orange-50/50 border-orange-100/50' : 'bg-gray-50/50 border-transparent'
        }`}>
          <p className={`text-xs font-black uppercase mb-1 ${
            efficiencyPct >= 80 ? 'text-green-500' :
            efficiencyPct >= 60 ? 'text-blue-400' :
            efficiencyPct > 0 ? 'text-orange-400' : 'text-gray-400'
          }`}>{t('efficiency')}</p>
          <p className={`text-xl font-black ${
            efficiencyPct >= 80 ? 'text-green-600' :
            efficiencyPct >= 60 ? 'text-blue-600' :
            efficiencyPct > 0 ? 'text-orange-500' : 'text-gray-400'
          }`}>
            {totalSessionMins > 0 ? `${efficiencyPct}%` : '--%'}
          </p>
        </div>
      </div>

      <CorrectionRequestModal isOpen={isCorrectionOpen} onClose={() => setIsCorrectionOpen(false)} />
    </div>
  );
}
