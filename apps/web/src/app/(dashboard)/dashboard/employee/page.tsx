'use client';

import React from 'react';
import { Calendar, Clock, Award, Briefcase } from 'lucide-react';

const MyMetric = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mb-4 shadow-lg p-3`}>
      <Icon size={24} />
    </div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-extrabold text-gray-900 leading-none">{value}</p>
  </div>
);

export default function EmployeeDashboard() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-100">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">Good Morning! Ready for your next challenge?</h1>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed opacity-90 font-medium text-pretty">
            You have 3 tasks due today and a team meeting at 2:00 PM. Keep pushing forward!
          </p>
          <button className="bg-white text-blue-600 px-8 py-3.5 rounded-2xl font-extrabold text-sm hover:bg-blue-50 transition-all shadow-xl">
            View Schedule
          </button>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MyMetric label="Work Hours" value="38.5h" icon={Clock} color="bg-blue-600" />
        <MyMetric label="Attendance" value="98%" icon={Calendar} color="bg-green-600" />
        <MyMetric label="Tasks Done" value="12" icon={Briefcase} color="bg-purple-600" />
        <MyMetric label="Perf. Score" value="4.8" icon={Award} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-extrabold text-gray-900 mb-6">Today's Schedule</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer group">
                <div className="w-2 h-10 bg-blue-100 rounded-full group-hover:bg-blue-600 transition-colors" />
                <div>
                  <p className="text-sm font-extrabold text-gray-900">Project Sync Meeting</p>
                  <p className="text-xs text-gray-500 font-medium">10:00 AM - 11:30 AM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Award size={32} />
          </div>
          <h3 className="text-lg font-extrabold text-gray-900 mb-2">New Milestone!</h3>
          <p className="text-sm text-gray-500 max-w-xs font-medium">You've maintained a 95% attendance record for 3 months in a row.</p>
        </div>
      </div>
    </div>
  );
}
