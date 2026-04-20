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
import { DayDetailsDrawer } from '@/components/calendar/DayDetailsDrawer';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Modals/Drawers
  const [isAddModeOpen, setIsAddModeOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [preSelectedDate, setPreSelectedDate] = useState<string | undefined>();
  
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayEvents, setDayEvents] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/calendar');
      setEvents(res.data);
      
      // Update dayEvents if drawer is open
      if (selectedDay) {
        const fresh = res.data.filter((e: any) => isSameDay(new Date(e.startDate), selectedDay));
        setDayEvents(fresh);
      }
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [selectedDay]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleSelectDay = (day: Date, dayEvts: any[]) => {
    if (dayEvts.length === 0 && isAdmin) {
      setPreSelectedDate(format(day, 'yyyy-MM-dd'));
      setEditingEvent(null);
      setIsAddModeOpen(true);
    } else {
      setSelectedDay(day);
      setDayEvents(dayEvts);
      setIsDrawerOpen(true);
    }
  };

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
    <div className="max-w-[1700px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <div className="relative overflow-hidden rounded-[40px] p-10 lg:p-14 border border-divider astra-glass shadow-2xl">
        <div className="absolute top-0 right-0 p-16 opacity-5 hidden lg:block">
          <CalendarIcon size={280} className="text-primary rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-5">
             <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20">
               <Sparkles size={16} className="text-primary animate-pulse" />
               <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Nexus Connect</span>
             </div>
             <div>
               <h1 className="text-5xl lg:text-7xl font-black text-foreground tracking-tight mb-4 leading-none">
                 Culture <span className="text-primary">Sync</span>
               </h1>
               <p className="text-muted-foreground/60 max-w-xl text-lg font-medium leading-relaxed">
                 The pulse of our organization. Coordinate milestones, respect holidays, and celebrate our shared journey.
               </p>
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             {isAdmin && (
               <>
                 <Button 
                   variant="outline"
                   onClick={handleSeedHolidays}
                   className="h-16 px-8 rounded-2xl border-divider text-[11px] font-black uppercase tracking-widest gap-2 bg-card hover:bg-muted"
                 >
                   <Sparkles size={18} className="text-amber-500" />
                   Seed Holidays
                 </Button>
                 <Button 
                   onClick={() => {
                     setEditingEvent(null);
                     setPreSelectedDate(undefined);
                     setIsAddModeOpen(true);
                   }}
                   className="h-16 px-10 rounded-2xl text-[11px] font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/25"
                 >
                   <Plus size={22} strokeWidth={3} />
                   Create Activity
                 </Button>
               </>
             )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between bg-card border border-divider px-8 py-5 rounded-[28px] shadow-sm">
            <div className="flex items-center gap-6">
              <h2 className="text-3xl font-black text-foreground tabular-nums tracking-tight">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-1.5 bg-muted/30 p-1.5 rounded-2xl border border-divider/50">
                <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="h-10 w-10 rounded-xl hover:bg-card hover:shadow-sm p-0">
                  <ChevronLeft size={20} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleToday} className="h-10 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-card hover:shadow-sm">
                  Today
                </Button>
                <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-10 w-10 rounded-xl hover:bg-card hover:shadow-sm p-0">
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          </div>

          <div className="min-h-[700px]">
             {loading ? (
               <div className="h-[700px] flex items-center justify-center bg-card border border-divider rounded-[40px]">
                 <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
               </div>
             ) : (
               <CalendarGrid 
                 currentDate={currentDate} 
                 events={events} 
                 isAdmin={isAdmin}
                 onRefresh={fetchEvents}
                 onSelectDay={handleSelectDay}
               />
             )}
          </div>
        </div>

        {/* Timeline Sidebar */}
        <div className="xl:w-96 space-y-6">
           <div className="bg-card/50 backdrop-blur-xl border border-divider rounded-[40px] p-10 space-y-8 sticky top-8 shadow-2xl">
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary/60">Upcoming</h3>
                <h2 className="text-2xl font-black text-foreground">Timeline</h2>
              </div>
              
              <div className="space-y-10 relative pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-divider before:opacity-30">
                {events.filter(e => {
                  const d = new Date(e.startDate);
                  const now = new Date();
                  now.setHours(0,0,0,0);
                  return d >= now && d <= addDays(now, 30);
                }).sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map((event, idx) => (
                  <div key={idx} className="group relative">
                    {/* Dot */}
                    <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-divider border-4 border-card outline outline-1 outline-divider group-hover:bg-primary group-hover:outline-primary/40 transition-all duration-500" />
                    
                    <div className="space-y-2">
                       <span className="inline-flex items-center px-3 py-1 bg-muted/80 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">
                         {format(new Date(event.startDate), 'MMM dd')}
                       </span>
                       <div className="p-5 rounded-2xl border border-divider hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-xl hover:shadow-primary/[0.03] transition-all duration-500 cursor-pointer" onClick={() => handleSelectDay(new Date(event.startDate), events.filter((e: any) => isSameDay(new Date(e.startDate), new Date(event.startDate))))}>
                          <h4 className="text-base font-black text-foreground group-hover:text-primary transition-colors">{event.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed font-medium opacity-60 italic whitespace-pre-wrap">
                            {event.description || 'No description provided'}
                          </p>
                       </div>
                    </div>
                  </div>
                ))}
                
                {events.filter(e => {
                  const d = new Date(e.startDate);
                  const now = new Date();
                  now.setHours(0,0,0,0);
                  return d >= now && d <= addDays(now, 30);
                }).length === 0 && (
                  <div className="py-20 text-center space-y-4 opacity-40">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" strokeWidth={1} />
                    <p className="text-xs font-black uppercase tracking-widest leading-loose">No upcoming<br/>milestones found</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      <DayDetailsDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        date={selectedDay}
        events={dayEvents}
        isAdmin={isAdmin}
        onRefresh={fetchEvents}
        onEdit={(evt) => {
          if (evt) {
            setEditingEvent(evt);
            setPreSelectedDate(undefined);
            setIsAddModeOpen(true);
          } else {
            // "Add Another" logic
            setPreSelectedDate(format(selectedDay!, 'yyyy-MM-dd'));
            setEditingEvent(null);
            setIsAddModeOpen(true);
          }
        }}
      />

      {isAdmin && (
        <AddEventModal 
          isOpen={isAddModeOpen} 
          onClose={() => setIsAddModeOpen(false)} 
          onSuccess={fetchEvents}
          initialEvent={editingEvent}
          preSelectedDate={preSelectedDate}
        />
      )}
    </div>
  );
}

