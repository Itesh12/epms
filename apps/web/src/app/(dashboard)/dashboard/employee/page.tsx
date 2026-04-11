'use client';

import React from 'react';
import { Calendar, Clock, Award, Briefcase, TrendingUp } from 'lucide-react';
import AttendanceHub from '@/components/attendance/AttendanceHub';
import AttendanceTimeline from '@/components/attendance/AttendanceTimeline';
import AttendanceHeatmap from '@/components/attendance/AttendanceHeatmap';
import { useAttendance } from '@/contexts/AttendanceContext';
import { useAuthStore } from '@/store/authStore';

const MetricCard = ({ label, value, icon: Icon, color, loading }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mb-4 shadow-lg p-3`}>
      <Icon size={24} />
    </div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    {loading ? (
      <div className="h-7 w-16 bg-gray-100 animate-pulse rounded-lg mt-1" />
    ) : (
      <p className="text-xl font-extrabold text-gray-900 leading-none">{value ?? '—'}</p>
    )}
  </div>
);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getFirstName = (name: string) => name?.split(' ')[0] || 'there';

export default function EmployeeDashboard() {
  const { metrics, metricsLoading, profile, attendance } = useAttendance();
  const { user } = useAuthStore();

  const displayName = profile?.name || user?.name || '';
  const jobTitle = profile?.jobTitle || user?.role || '';
  const department = profile?.department;

  // Dynamic greeting subtitle based on real attendance
  const getSubtitle = () => {
    if (!attendance) return `Ready to start your shift? Click "Start Shift" below.`;
    if (attendance.checkOutTime) return `You've completed your shift today. Great work! 🎉`;
    if (attendance.status === 'ON_BREAK') return `You're on a break. Remember to resume when ready!`;
    if (attendance.status === 'PRESENT') return `You're currently clocked in. Keep up the great work! 💪`;
    return `Ready to start your shift? Click "Start Shift" below.`;
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner — dynamic greeting */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-100">
        <div className="relative z-10 max-w-xl">
          <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
            {getGreeting()}, {getFirstName(displayName)}! 👋
          </h1>
          {jobTitle && (
            <p className="text-blue-300 text-sm font-semibold mb-1">
              {jobTitle}{department ? ` · ${department}` : ''}
            </p>
          )}
          <p className="text-blue-100 text-base mb-8 leading-relaxed opacity-90 font-medium">
            {getSubtitle()}
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-4 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Attendance Hub */}
      <AttendanceHub />

      {/* Real Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Work Hours (week)"
          value={metrics?.workHours}
          icon={Clock}
          color="bg-blue-600"
          loading={metricsLoading}
        />
        <MetricCard
          label="Attendance (month)"
          value={metrics?.attendance}
          icon={Calendar}
          color="bg-green-600"
          loading={metricsLoading}
        />
        <MetricCard
          label="Efficiency"
          value={metrics?.efficiency}
          icon={TrendingUp}
          color="bg-purple-600"
          loading={metricsLoading}
        />
        <MetricCard
          label="Perf. Score (/5)"
          value={metrics?.perfScore}
          icon={Award}
          color="bg-orange-500"
          loading={metricsLoading}
        />
      </div>

      {/* Timeline */}
      <AttendanceTimeline />

      {/* Heatmap */}
      <AttendanceHeatmap />

      {/* Bottom Cards — real employee info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Employee Profile Summary */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-extrabold text-gray-900 mb-6">Your Profile</h3>
          {profile ? (
            <div className="space-y-3">
              {[
                { label: 'Full Name', value: profile.name },
                { label: 'Job Title', value: profile.jobTitle || '—' },
                { label: 'Department', value: profile.department || '—' },
                { label: 'Employee ID', value: profile.employeeId || '—' },
                { label: 'Status', value: profile.status },
                { label: 'Joined', value: profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                  <span className="text-sm font-bold text-gray-900">{value}</span>
                </div>
              ))}
              {profile.skills.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Skills</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-50 animate-pulse rounded-xl" />
              ))}
            </div>
          )}
        </div>

        {/* Today's Attendance Summary */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-extrabold text-gray-900 mb-6">Today's Summary</h3>
          {attendance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <p className="text-xs font-black text-blue-400 uppercase mb-1">Check In</p>
                  <p className="text-xl font-black text-blue-700">
                    {attendance.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-black text-gray-400 uppercase mb-1">Check Out</p>
                  <p className="text-xl font-black text-gray-700">
                    {attendance.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-2xl">
                  <p className="text-xs font-black text-green-500 uppercase mb-1">Work Time</p>
                  <p className="text-xl font-black text-green-700">
                    {Math.floor((attendance.totalWorkMinutes || 0) / 60)}h {(attendance.totalWorkMinutes || 0) % 60}m
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-2xl">
                  <p className="text-xs font-black text-orange-400 uppercase mb-1">Break Time</p>
                  <p className="text-xl font-black text-orange-600">
                    {Math.floor((attendance.totalBreakMinutes || 0) / 60)}h {(attendance.totalBreakMinutes || 0) % 60}m
                  </p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600">Activities today</span>
                <span className="text-lg font-black text-gray-900">{attendance.activities?.length || 0}</span>
              </div>
              <div className="p-4 rounded-2xl flex items-center justify-between bg-blue-50 border border-blue-100">
                <span className="text-sm font-bold text-blue-600">Status</span>
                <span className={`text-sm font-black px-3 py-1 rounded-full ${
                  attendance.checkOutTime ? 'bg-green-100 text-green-700' :
                  attendance.status === 'ON_BREAK' ? 'bg-orange-100 text-orange-700' :
                  attendance.status === 'PRESENT' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {attendance.checkOutTime ? 'Completed' : attendance.status?.replace('_', ' ') || 'Not Started'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4">
                <Clock size={32} />
              </div>
              <p className="text-sm font-bold text-gray-400">No attendance recorded today yet.</p>
              <p className="text-xs text-gray-300 mt-1">Check in above to start tracking.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
