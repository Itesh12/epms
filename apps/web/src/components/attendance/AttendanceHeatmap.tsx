'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useAttendance } from '@/contexts/AttendanceContext';
import { format, startOfYear, eachDayOfInterval, endOfYear, getDay, isSameDay } from 'date-fns';

export default function AttendanceHeatmap() {
  const { getHeatmapData } = useAttendance();
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      setLoading(true);
      try {
        const heatmapData = await getHeatmapData(year.toString());
        setData(heatmapData);
      } catch (error) {
        console.error('Heatmap fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, [year, getHeatmapData]);

  const days = eachDayOfInterval({
    start: startOfYear(new Date(year, 0, 1)),
    end: endOfYear(new Date(year, 0, 1))
  });

  const getDayColor = (date: Date) => {
    const dayData = data.find(d => isSameDay(new Date(d.date), date));
    if (!dayData) return 'bg-gray-100';
    
    const mins = dayData.totalWorkMinutes || 0;
    if (mins === 0) return 'bg-blue-50';
    if (mins < 240) return 'bg-blue-200'; // < 4h
    if (mins < 480) return 'bg-blue-400'; // < 8h
    return 'bg-blue-600'; // 8h+
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <Calendar className="text-blue-600" />
            Consistency Heatmap
          </h3>
          <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-tight">Your attendance frequency for {year}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
          <button 
            onClick={() => setYear(year - 1)}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="px-4 font-black text-gray-900">{year}</span>
          <button 
            onClick={() => setYear(year + 1)}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(53,1fr)] gap-1 animate-pulse">
          {Array.from({ length: 365 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-4 scrollbar-hide">
            {/* Day Labels */}
            <div className="grid grid-rows-7 pr-4 text-[10px] font-black text-gray-300 uppercase">
              <span className="h-4">Mon</span>
              <span className="h-4" />
              <span className="h-4">Wed</span>
              <span className="h-4" />
              <span className="h-4">Fri</span>
              <span className="h-4" />
              <span className="h-4" />
            </div>

            {days.map((day, i) => (
              <motion.div
                key={day.toISOString()}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.001 }}
                className={`w-3.5 h-3.5 rounded-sm ${getDayColor(day)} transition-all hover:ring-2 hover:ring-blue-100 cursor-pointer`}
                title={`${format(day, 'MMM dd, yyyy')}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded-sm" />
              <div className="w-3 h-3 bg-blue-200 rounded-sm" />
              <div className="w-3 h-3 bg-blue-400 rounded-sm" />
              <div className="w-3 h-3 bg-blue-600 rounded-sm" />
            </div>
            <span>More</span>
          </div>
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
            <Info size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-blue-900 leading-none mb-1">Getting Started?</p>
            <p className="text-xs font-bold text-blue-600 opacity-80">Mark your first check-in today to see your consistency map grow!</p>
          </div>
        </div>
      )}
    </div>
  );
}
