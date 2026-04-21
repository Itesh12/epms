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
  const [isSeeded, setIsSeeded] = useState(false);
  
  // State for Modals/Drawers
  const [isAddModeOpen, setIsAddModeOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [preSelectedDate, setPreSelectedDate] = useState<string | undefined>();
  
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayEvents, setDayEvents] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const checkSeedingStatus = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/calendar/seeding-status');
      setIsSeeded(res.data);
    } catch (err) {
      console.error('Failed to check seeding status', err);
    }
  }, [isAdmin]);

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
      
      checkSeedingStatus();
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [selectedDay, checkSeedingStatus]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePrevMonth = () => {
    const prev = subMonths(currentDate, 1);
    if (prev.getFullYear() === 2026) setCurrentDate(prev);
  };
  const handleNextMonth = () => {
    const next = addMonths(currentDate, 1);
    if (next.getFullYear() === 2026) setCurrentDate(next);
  };
  const handleToday = () => setCurrentDate(new Date());

  const handleSelectDay = (day: Date, dayEvts: any[]) => {
    if (dayEvts.length === 0 && isAdmin) {
      setPreSelectedDate(format(day, 'yyyy-MM-dd'));
      setEditingEvent(null);
      setIsAddModeOpen(true);
    } else if (dayEvts.length > 0) {
      setSelectedDay(day);
      setDayEvents(dayEvts);
      setIsDrawerOpen(true);
    }
  };

  const handleSeedHolidays = async () => {
    if (!isAdmin) return;
    try {
      await api.post('/calendar/seed-holidays');
      toast.success('Holidays seeded successfully');
      fetchEvents();
    } catch {
      toast.error('Failed to seed holidays');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Header section - Compactified */}
      <div className="relative overflow-hidden rounded-[32px] p-6 lg:p-8 border border-divider astra-glass shadow-xl">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] hidden lg:block">
          <CalendarIcon size={200} className="text-primary rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
               <Sparkles size={14} className="text-primary animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Nexus Connect</span>
             </div>
             <div>
               <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-none uppercase">
                 Timeline <span className="text-primary">Sync</span>
               </h1>
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             {isAdmin && (
               <>
                 {!isSeeded && (
                   <Button 
                     variant="outline"
                     onClick={handleSeedHolidays}
                     className="h-10 px-5 rounded-xl border-divider text-[9px] font-black uppercase tracking-widest gap-2 bg-card hover:bg-muted"
                   >
                     <Sparkles size={14} className="text-amber-500" />
                     Seed Holidays
                   </Button>
                 )}
                 <Button 
                   onClick={() => {
                     setEditingEvent(null);
                     setPreSelectedDate(undefined);
                     setIsAddModeOpen(true);
                   }}
                   className="h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
                 >
                   <Plus size={16} strokeWidth={3} />
                   Add Activity
                 </Button>
               </>
             )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-5">
          <div className="flex items-center justify-between bg-card border border-divider px-6 py-3.5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-5">
              <h2 className="text-xl font-black text-foreground tabular-nums tracking-wider uppercase">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-divider/50">
                <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="h-8 w-8 rounded-lg hover:bg-card">
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleToday} className="h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-card">
                  Today
                </Button>
                <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-8 w-8 rounded-lg hover:bg-card">
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>

          <div className="min-h-[700px]">
             {loading ? (
               <div className="h-[700px] flex items-center justify-center bg-card border border-divider rounded-[32px]">
                 <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
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

        {/* Timeline Sidebar - Compactified */}
        <div className="xl:w-80 space-y-5">
           <div className="bg-card border border-divider rounded-[32px] p-6 space-y-6 sticky top-6 shadow-xl">
              <div className="space-y-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Upcoming</h3>
                <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Timeline</h2>
              </div>
              
              <div className="space-y-6 relative pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-divider before:opacity-30">
                {events.filter(e => {
                  const d = new Date(e.startDate);
                  const now = new Date();
                  now.setHours(0,0,0,0);
                  return d >= now && d <= addDays(now, 30);
                }).sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map((event, idx) => (
                  <div key={idx} className="group relative">
                    {/* Dot */}
                    <div className="absolute left-[-21px] top-1 w-2 h-2 rounded-full bg-primary/40 border-2 border-card outline outline-1 outline-divider group-hover:bg-primary group-hover:outline-primary/40 transition-all duration-500" />
                    
                    <div className="space-y-1.5">
                       <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">
                         {format(new Date(event.startDate), 'MMM dd')}
                       </span>
                       <div className="p-3.5 rounded-xl border border-divider bg-muted/20 hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-300 cursor-pointer" onClick={() => handleSelectDay(new Date(event.startDate), events.filter((e: any) => isSameDay(new Date(e.startDate), new Date(event.startDate))))}>
                          <h4 className="text-xs font-black text-foreground group-hover:text-primary transition-colors leading-tight uppercase tracking-tight">{event.title}</h4>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 font-medium italic leading-none">
                            {event.description || 'No description'}
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
                  <div className="py-12 text-center space-y-3 opacity-30">
                    <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground" strokeWidth={1.5} />
                    <p className="text-[8px] font-black uppercase tracking-widest leading-loose">No upcoming<br/>milestones</p>
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

