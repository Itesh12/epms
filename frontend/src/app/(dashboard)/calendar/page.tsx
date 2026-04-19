'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval 
} from 'date-fns';
import { Button } from '@/components/ui/Button';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { AddEventModal } from '@/components/calendar/AddEventModal';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModeOpen, setIsAddModeOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/calendar');
      setEvents(res.data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleSeedHolidays = async () => {
    if (!isAdmin) return;
    try {
      await api.post('/calendar/seed-holidays');
      toast.success('Indian Public Holidays seeded successfully!');
      fetchEvents();
    } catch {
      toast.error('Failed to seed holidays');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section with Glassmorphism */}
      <div className="relative overflow-hidden rounded-[32px] p-8 lg:p-12 border border-divider astra-glass shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 hidden lg:block">
          <CalendarIcon size={240} className="text-primary rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
               <Sparkles size={14} className="text-primary animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Connect Hub</span>
             </div>
             <div>
               <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-2">
                 Organization <span className="text-primary">Calendar</span>
               </h1>
               <p className="text-muted-foreground/60 max-w-xl text-lg font-medium leading-relaxed">
                 Coordinate cross-functional events, track shared holidays, and stay aligned with the organization's heartbeat.
               </p>
             </div>
          </div>

          <div className="flex items-center gap-4">
             {isAdmin && (
               <>
                 <Button 
                   variant="outline"
                   onClick={handleSeedHolidays}
                   className="h-14 px-6 rounded-2xl border-divider text-[11px] font-black uppercase tracking-widest gap-2 bg-card hover:bg-muted"
                 >
                   <Sparkles size={16} className="text-amber-500" />
                   Seed 2026 Holidays
                 </Button>
                 <Button 
                   onClick={() => setIsAddModeOpen(true)}
                   className="h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/25"
                 >
                   <Plus size={20} strokeWidth={3} />
                   Add New Event
                 </Button>
               </>
             )}
          </div>
        </div>
      </div>

      {/* Main Calendar Controls */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between bg-card border border-divider p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-foreground tabular-nums">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-divider">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-9 w-9 rounded-lg">
                  <ChevronLeft size={18} />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleToday} className="h-9 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Today
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-9 w-9 rounded-lg">
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/20" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Holidays</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-primary shadow-sm shadow-primary/20" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Company Events</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Deadlines</span>
               </div>
            </div>
          </div>

          <div className="bg-card border border-divider rounded-[32px] overflow-hidden shadow-xl p-2 min-h-[700px]">
             {loading ? (
               <div className="h-[700px] flex items-center justify-center">
                 <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
               </div>
             ) : (
               <CalendarGrid 
                 currentDate={currentDate} 
                 events={events} 
                 isAdmin={isAdmin}
                 onRefresh={fetchEvents}
               />
             )}
          </div>
        </div>

        {/* Sidebar Panel for Upcoming Events */}
        <div className="lg:w-80 space-y-6">
           <div className="bg-card border border-divider rounded-[32px] p-8 space-y-6 shadow-xl sticky top-8">
              <div className="flex items-center justify-between pb-4 border-b border-divider">
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Upcoming</h3>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">Next 30 Days</span>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {events.filter(e => {
                  const d = new Date(e.startDate);
                  const now = new Date();
                  return d >= now && d <= addDays(now, 30);
                }).sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map((event, idx) => (
                  <div key={idx} className="group p-4 rounded-2xl border border-divider hover:border-primary/30 hover:bg-primary/5 transition-all cursor-default">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">
                      {format(new Date(event.startDate), 'MMM dd')}
                    </p>
                    <h4 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{event.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 opacity-60 leading-relaxed font-medium">{event.description || 'No description provided'}</p>
                  </div>
                ))}
                
                {events.filter(e => {
                  const d = new Date(e.startDate);
                  const now = new Date();
                  return d >= now && d <= addDays(now, 30);
                }).length === 0 && (
                  <div className="py-12 text-center space-y-3 opacity-40">
                    <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No upcoming events</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {isAdmin && (
        <AddEventModal 
          isOpen={isAddModeOpen} 
          onClose={() => setIsAddModeOpen(false)} 
          onSuccess={fetchEvents}
        />
      )}
    </div>
  );
}
