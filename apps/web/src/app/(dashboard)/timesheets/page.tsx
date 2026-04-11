'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTimesheet, saveTimesheetEntries, submitTimesheet } from '@/services/timesheets';
import { getMyTasks } from '@/services/tasks';
import { Task, TimesheetEntry } from '@epms/shared';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Save, Send, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function TimesheetsPage() {
  const queryClient = useQueryClient();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [localEntries, setLocalEntries] = useState<TimesheetEntry[]>([]);

  const { data: timesheet, isLoading } = useQuery({
    queryKey: ['timesheet', format(currentWeekStart, 'yyyy-MM-dd')],
    queryFn: () => getTimesheet(format(currentWeekStart, 'yyyy-MM-dd')),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['myTasks'],
    queryFn: getMyTasks,
  });

  useEffect(() => {
    if (timesheet?.entries) {
      setLocalEntries(timesheet.entries);
    }
  }, [timesheet]);

  const saveMutation = useMutation({
    mutationFn: (entries: TimesheetEntry[]) => saveTimesheetEntries(timesheet!.id || (timesheet as any)._id, entries),
    onSuccess: () => {
      toast.success('Timesheet saved successfully');
      queryClient.invalidateQueries({ queryKey: ['timesheet'] });
    }
  });

  const submitMutation = useMutation({
    mutationFn: () => submitTimesheet(timesheet!.id || (timesheet as any)._id),
    onSuccess: () => {
      toast.success('Timesheet submitted for approval!');
      queryClient.invalidateQueries({ queryKey: ['timesheet'] });
    }
  });

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  const handleHoursChange = (task: Task, date: Date, hours: string) => {
    const num = parseFloat(hours) || 0;
    const existing = localEntries.findIndex(e => e.taskId === (task.id || (task as any)._id) && isSameDay(new Date(e.date), date));
    
    let next = [...localEntries];
    if (existing >= 0) {
      if (num === 0) next.splice(existing, 1);
      else next[existing].hoursLogged = num;
    } else if (num > 0) {
      next.push({
        taskId: task.id || (task as any)._id,
        projectId: task.projectId,
        date: date.toISOString(),
        hoursLogged: num
      });
    }
    setLocalEntries(next);
  };

  const getHours = (task: Task, date: Date) => {
    const e = localEntries.find(entry => entry.taskId === (task.id || (task as any)._id) && isSameDay(new Date(entry.date), date));
    return e ? e.hoursLogged.toString() : '';
  };

  const getTotalForDay = (date: Date) => {
    return localEntries.filter(e => isSameDay(new Date(e.date), date)).reduce((s, e) => s + Number(e.hoursLogged), 0);
  };

  const getTotalForTask = (task: Task) => {
    return localEntries.filter(e => e.taskId === (task.id || (task as any)._id)).reduce((s, e) => s + Number(e.hoursLogged), 0);
  };

  const grandTotal = localEntries.reduce((s, e) => s + Number(e.hoursLogged), 0);
  const isEditable = !timesheet || timesheet.status === 'DRAFT' || timesheet.status === 'REJECTED';

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Loading timesheet matrix...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Clock size={24} /></span>
            Timesheets
          </h1>
          <p className="text-gray-500 mt-1">Log your weekly work hours across all your assigned tasks.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
            <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))} className="p-1.5 hover:bg-white rounded shadow-sm text-gray-600"><ChevronLeft size={18}/></button>
            <div className="px-4 py-1.5 font-semibold text-sm text-gray-700 min-w-[200px] text-center">
              {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
            </div>
            <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))} className="p-1.5 hover:bg-white rounded shadow-sm text-gray-600"><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
              timesheet?.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
              timesheet?.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-600' :
              timesheet?.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
              'bg-red-100 text-red-600'
            }`}>
              {timesheet?.status || 'DRAFT'}
            </span>
          </div>
          {isEditable && (
             <div className="flex gap-2">
              <button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(localEntries)} className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 hover:bg-gray-100 font-medium rounded-xl transition-colors disabled:opacity-50 text-sm">
                <Save size={16} /> Save Draft
              </button>
              <button disabled={submitMutation.isPending} onClick={() => submitMutation.mutate()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 disabled:opacity-50 text-sm">
                <Send size={16} /> Submit for Approval
              </button>
             </div>
          )}
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b">
                <th className="p-4 font-semibold text-gray-600 text-sm w-1/4 min-w-[200px]">Task / Project</th>
                {weekDays.map(date => (
                  <th key={date.toISOString()} className="p-4 font-semibold text-gray-600 text-sm text-center min-w-[80px]">
                    <span className="block text-gray-400 text-xs font-normal uppercase tracking-wider mb-0.5">{format(date, 'eee')}</span>
                    {format(date, 'd')}
                  </th>
                ))}
                <th className="p-4 font-bold text-gray-800 text-sm text-center bg-gray-100">Total</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task: Task) => (
                <tr key={task.id || (task as any)._id} className="border-b hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm">
                    <p className="font-bold text-gray-900 line-clamp-1">{task.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{(task.projectId as any)?.name || 'Unknown Project'}</p>
                  </td>
                  {weekDays.map(date => (
                    <td key={date.toISOString()} className="p-2 align-middle">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        disabled={!isEditable}
                        value={getHours(task, date)}
                        onChange={(e) => handleHoursChange(task, date, e.target.value)}
                        className="w-full h-10 text-center bg-transparent border border-transparent hover:border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all disabled:opacity-75 font-medium text-gray-700"
                        placeholder="-"
                      />
                    </td>
                  ))}
                  <td className="p-4 text-center font-bold text-gray-700 bg-gray-50">
                    {getTotalForTask(task) || '-'}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                   <td colSpan={9} className="p-6 text-center text-gray-500">No tasks assigned to you.</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 border-t-2 border-gray-200">
                <td className="p-4 font-bold text-gray-900 text-right">Daily Totals:</td>
                {weekDays.map(date => (
                  <td key={date.toISOString()} className="p-4 text-center font-bold text-gray-800">
                    {getTotalForDay(date) || '-'}
                  </td>
                ))}
                <td className="p-4 text-center font-black text-blue-700 text-lg">
                  {grandTotal}h
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
