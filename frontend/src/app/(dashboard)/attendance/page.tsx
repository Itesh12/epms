'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Coffee, 
  LogOut, 
  Activity, 
  CheckCircle2, 
  Loader2,
  TrendingUp,
  Timer,
  AlertCircle,
  Zap,
  User,
  History as HistoryIcon,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { format, differenceInSeconds, startOfMonth, endOfMonth, getDaysInMonth, parseISO } from 'date-fns';
import { AttendanceTimeline } from '@/components/attendance/AttendanceTimeline';
import { AttendanceAdminView } from '@/components/attendance/AttendanceAdminView';
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar';
import { EditAttendanceModal } from '@/components/attendance/EditAttendanceModal';
import { StreakWidget } from '@/components/attendance/StreakWidget';
import { LeaderboardPanel } from '@/components/attendance/LeaderboardPanel';
import { ExportAttendanceModal } from '@/components/attendance/ExportAttendanceModal';
import { useAuthStore } from '@/store/useAuthStore';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';

const MONTHLY_GOAL_HOURS = 210;
const MONTHLY_GOAL_MINUTES = MONTHLY_GOAL_HOURS * 60;
const LATE_THRESHOLD = '10:30';
const WARNING_THRESHOLD = '10:25';

export default function AttendancePage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'my' | 'calendar' | 'admin'>('my');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Calendar specific state
  const [calendarHistory, setCalendarHistory] = useState<any[]>([]);
  const [selectedCalendarEmployee, setSelectedCalendarEmployee] = useState(user?.id || '');
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [selectedDayRecord, setSelectedDayRecord] = useState<any | undefined>(undefined);

  // Late notification state to avoid double toasts
  const [hasWarned, setHasWarned] = useState(false);
  const [hasLateAlert, setHasLateAlert] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Smart Late Warning logic
      if (!todayRecord?.checkIn) {
        const timeStr = format(now, 'HH:mm');
        if (timeStr === WARNING_THRESHOLD && !hasWarned) {
          toast('5 minutes until Late mark! Clock in soon.', { icon: '️⏰', duration: 10000 });
          setHasWarned(true);
        }
        if (timeStr === LATE_THRESHOLD && !hasLateAlert) {
          toast.error('You are now past the punctuality threshold. Late mark will be applied on check-in.', { duration: 10000 });
          setHasLateAlert(true);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [todayRecord, hasWarned, hasLateAlert]);

  const fetchData = async () => {
    try {
      const [todayRes, historyRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/me')
      ]);
      setTodayRecord(todayRes.data);
      setHistory(historyRes.data);
      // If we are on 'my' or 'calendar' tab and user is not admin selecting someone else
      if (activeTab !== 'admin' && (!selectedCalendarEmployee || selectedCalendarEmployee === user?.id)) {
        setCalendarHistory(historyRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance data', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    const role = user?.role?.toUpperCase();
    if (role === 'ADMIN' || role === 'MANAGER') {
      api.get('/users').then(res => {
        // If res is the success object {success: true, data: [...]}, res.data is the array.
        // If res is already the data because of some other interceptor level, handle it.
        const users = Array.isArray(res) ? res : (res.data || []);
        setEmployees(users);
      }).catch(err => {
        console.error('Failed to fetch employees for list:', err.response?.status, err.response?.data || err.message);
        toast.error('Could not load employee list');
      });
    }
    fetchData();
  }, [user?.role]);



  // Handle calendar employee change
  useEffect(() => {
    if (activeTab === 'calendar' && selectedCalendarEmployee && selectedCalendarEmployee !== user?.id) {
      setLoadingCalendar(true);
      api.get(`/attendance/admin/user/${selectedCalendarEmployee}`)
        .then(res => setCalendarHistory(res.data))
        .finally(() => setLoadingCalendar(false));
    } else if (activeTab === 'calendar' && selectedCalendarEmployee === user?.id) {
      setCalendarHistory(history);
    }
  }, [selectedCalendarEmployee, activeTab, history, user?.id]);

  const employeeOptions = useMemo<SelectOption[]>(() => {
    const userName = `${user?.firstName || 'My'} ${user?.lastName || 'History'}`.trim();
    return [
      { value: user?.id || '', label: `My History (${userName})`, icon: <HistoryIcon size={14} /> },
      ...employees.filter(e => String(e._id) !== String(user?.id)).map(e => ({
        value: e._id,
        label: `${e.firstName || 'Employee'} ${e.lastName || ''}`.trim(),
        icon: <User size={14} />
      }))
    ];
  }, [employees, user]);

  // ─── 210h Monthly Analytics Engine ──────────────────────────────────────
  const analytics = useMemo(() => {
    const now = new Date();
// ... (omitting lines for brevity in this replace_file_content chunk, but ensuring I don't break logic)
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const totalDaysInMonth = getDaysInMonth(now);
    const dayOfMonth = now.getDate();
    const daysRemaining = Math.max(totalDaysInMonth - dayOfMonth, 0);

    const thisMonthRecords = history.filter(r => {
      const d = parseISO(r.date);
      return d >= monthStart && d <= monthEnd;
    });

    const totalMinutesEarned = thisMonthRecords.reduce((sum, r) => sum + (r.totalWorkMinutes || 0), 0);
    const totalHoursEarned = totalMinutesEarned / 60;
    const progressPct = Math.min((totalMinutesEarned / MONTHLY_GOAL_MINUTES) * 100, 100);

    const remainingMinutes = Math.max(MONTHLY_GOAL_MINUTES - totalMinutesEarned, 0);
    const requiredDailyMinutes = daysRemaining > 0 ? remainingMinutes / daysRemaining : 0;
    const requiredDailyHours = requiredDailyMinutes / 60;

    // Pace: compare actual avg/day vs ideal avg/day
    const idealDailyMinutes = MONTHLY_GOAL_MINUTES / totalDaysInMonth;
    const avgActualDaily = dayOfMonth > 0 ? totalMinutesEarned / dayOfMonth : 0;
    let paceStatus: 'ahead' | 'on-track' | 'behind' = 'on-track';
    if (avgActualDaily > idealDailyMinutes * 1.05) paceStatus = 'ahead';
    else if (avgActualDaily < idealDailyMinutes * 0.90) paceStatus = 'behind';

    // Avg break time this month
    const recordsWithBreaks = thisMonthRecords.filter(r => r.checkIn && r.checkOut);
    let totalBreakMinutes = 0;
    recordsWithBreaks.forEach(r => {
      const totalMs = new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime();
      const workMs = (r.totalWorkMinutes || 0) * 60 * 1000;
      totalBreakMinutes += Math.max(0, (totalMs - workMs) / (1000 * 60));
    });
    const avgBreakMinutes = recordsWithBreaks.length > 0 ? totalBreakMinutes / recordsWithBreaks.length : 0;

    // Punctuality
    const markedRecords = thisMonthRecords.filter(r => r.status !== 'ABSENT');
    const presentCount = markedRecords.filter(r => r.status === 'PRESENT').length;
    const punctualityPct = markedRecords.length > 0 ? Math.round((presentCount / markedRecords.length) * 100) : 100;

    return { totalHoursEarned, progressPct, requiredDailyHours, paceStatus, avgBreakMinutes, punctualityPct, thisMonthRecords, totalDaysInMonth };
  }, [history]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/check-in');
      toast.success('Successfully checked in');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    } finally { setActionLoading(false); }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/check-out');
      toast.success('Successfully checked out');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    } finally { setActionLoading(false); }
  };

  const handleToggleBreak = async () => {
    setActionLoading(true);
    const isOnBreak = todayRecord?.breaks?.some((b: any) => !b.endTime);
    try {
      if (isOnBreak) {
        await api.post('/attendance/break/end');
        toast.success('Welcome back!');
      } else {
        await api.post('/attendance/break/start', { reason: 'Break' });
        toast.success('Break started');
      }
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally { setActionLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
      </div>
    );
  }

  const isOnBreak = todayRecord?.breaks?.some((b: any) => !b.endTime);
  const isFinished = !!todayRecord?.checkOut;
  const isCheckedIn = !!todayRecord?.checkIn;

  const paceConfig = {
    ahead:      { label: 'Ahead of Schedule', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', Icon: Zap },
    'on-track': { label: 'On Track',           color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',      Icon: CheckCircle2 },
    behind:     { label: 'Behind Pace',        color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/20',    Icon: AlertCircle },
  };
  const { label: paceLabel, color: paceColor, bg: paceBg, Icon: PaceIcon } = paceConfig[analytics.paceStatus];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 max-w-[1400px]">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Clock size={14} className="text-primary" />
            </div>
            <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Attendance System</span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight leading-tight">Workforce Presence</h1>
          <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed">
            Record your daily check-ins, manage breaks, and track your 210h monthly target.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <Button 
             variant="outline" 
             onClick={() => setIsExportModalOpen(true)} 
             className="h-14 px-6 rounded-2xl border-divider text-[10px] font-black uppercase tracking-widest gap-2 bg-card"
           >
              <Download size={14} />
              Export History
           </Button>
           <div className="flex items-center gap-4 bg-muted/60 p-2 rounded-2xl border border-divider shadow-sm">
             <div className="px-4 py-2 border-r border-divider">
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Current Date</p>
               <p className="text-sm font-bold text-foreground">{format(currentTime, 'MMMM dd, yyyy')}</p>
             </div>
             <div className="px-4 py-2">
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Current Time</p>
               <p className="text-sm font-black text-primary tabular-nums">{format(currentTime, 'HH:mm:ss')}</p>
             </div>
           </div>
        </div>
      </div>

      {/* ── Admin Tab Nav ───────────────────────────────── */}
      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
        <div className="flex p-1 bg-muted/40 border border-divider rounded-2xl w-fit">
          {(['my', 'calendar', 'admin'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab
                  ? "bg-card text-foreground shadow-lg border border-divider"
                  : "text-muted-foreground hover:text-foreground ml-1"
              )}
            >
              {tab === 'my' ? 'My Insights' : tab === 'calendar' ? 'Attendance Calendar' : 'Attendance Ledger'}
            </button>
          ))}
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────── */}
      {activeTab === 'my' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">

          {/* ── Left: Clock + Timeline ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Clock Card */}
            <div className="bg-card border border-divider rounded-[32px] p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Status Overview</p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-4xl font-black text-foreground tracking-tighter">
                        {!isCheckedIn ? 'Not Clocked In' : isFinished ? 'Shift Completed' : isOnBreak ? 'On Break' : 'Currently Active'}
                      </h2>
                      {isCheckedIn && !isFinished && <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Check In Time</p>
                      <p className="text-lg font-bold text-foreground tabular-nums">
                        {todayRecord?.checkIn ? format(new Date(todayRecord.checkIn), 'HH:mm') : '--:--'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Check Out Time</p>
                      <p className="text-lg font-bold text-foreground tabular-nums">
                        {todayRecord?.checkOut ? format(new Date(todayRecord.checkOut), 'HH:mm') : '--:--'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-6">
                    {!isCheckedIn ? (
                      <Button onClick={handleCheckIn} isLoading={actionLoading} className="h-14 px-10 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                        <Clock size={18} className="mr-3" /> Clock In Now
                      </Button>
                    ) : !isFinished ? (
                      <>
                        <Button
                          variant={isOnBreak ? 'primary' : 'outline'}
                          onClick={handleToggleBreak}
                          isLoading={actionLoading}
                          className={cn("h-14 px-10 rounded-2xl text-xs font-black uppercase tracking-widest", !isOnBreak && "border-divider")}
                        >
                          {isOnBreak ? <Activity size={18} className="mr-3" /> : <Coffee size={18} className="mr-3" />}
                          {isOnBreak ? 'Resume Work' : 'Start Break'}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={handleCheckOut}
                          isLoading={actionLoading}
                          className="h-14 px-10 rounded-2xl text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                        >
                          <LogOut size={18} className="mr-3" /> Finish Shift
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <CheckCircle2 size={24} className="text-emerald-500" />
                        <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Shift Completed Successfully</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Timer */}
                <div className="w-52 h-52 relative flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 border-[10px] border-divider rounded-full" />
                  <div className="text-center">
                    <Timer size={22} className="text-primary mx-auto mb-2 opacity-40" />
                    <p className="text-2xl font-black text-foreground tracking-tighter tabular-nums">
                      {isCheckedIn && !isFinished ? (() => {
                        let totalSeconds = differenceInSeconds(currentTime, new Date(todayRecord.checkIn));
                        todayRecord.breaks?.forEach((b: any) => {
                          if (b.startTime && b.endTime) totalSeconds -= differenceInSeconds(new Date(b.endTime), new Date(b.startTime));
                          else if (b.startTime && !b.endTime) totalSeconds -= differenceInSeconds(currentTime, new Date(b.startTime));
                        });
                        const h = Math.floor(totalSeconds / 3600);
                        const m = Math.floor((totalSeconds % 3600) / 60);
                        const s = totalSeconds % 60;
                        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                      })() : '00:00:00'}
                    </p>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1">Active Time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card border border-divider rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Today's Lifecycle</h3>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Minute-by-minute activity</p>
                </div>
                <Activity size={18} className="text-primary/40" />
              </div>
              <AttendanceTimeline record={todayRecord} />
            </div>
          </div>

          {/* ── Right: Analytics ── */}
          <div className="space-y-8">
            
            {/* Streak Widget */}
            <StreakWidget history={history} />

            {/* Leaderboard Panel */}
            <LeaderboardPanel />

            {/* 210h Monthly Progress */}
            <div className="bg-card border border-divider rounded-[32px] p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                    <TrendingUp size={16} />
                  </div>
                  <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Monthly Progress</h3>
                </div>
                <span className="text-[9px] font-black text-muted-foreground opacity-40">{format(currentTime, 'MMM yyyy')}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Monthly Goal</p>
                  <p className="text-sm font-black text-foreground">
                    {analytics.totalHoursEarned.toFixed(1)}h <span className="text-muted-foreground font-medium">/ {MONTHLY_GOAL_HOURS}h</span>
                  </p>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-primary rounded-full transition-all duration-700"
                    style={{ width: `${analytics.progressPct}%` }}
                  />
                </div>
                <p className="text-[9px] font-black text-muted-foreground opacity-40">{analytics.progressPct.toFixed(1)}% achieved this month</p>
              </div>

              {/* Pace badge */}
              <div className={cn("flex items-center gap-2.5 px-4 py-3 rounded-2xl border", paceBg)}>
                <PaceIcon size={14} className={paceColor} />
                <div>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest", paceColor)}>{paceLabel}</p>
                  <p className="text-[9px] text-muted-foreground opacity-60">
                    Need <span className="font-black text-foreground">{analytics.requiredDailyHours.toFixed(1)}h/day</span> to reach {MONTHLY_GOAL_HOURS}h
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-muted/30 rounded-2xl border border-divider">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Avg Break</p>
                  <p className="text-lg font-bold text-foreground">
                    {analytics.avgBreakMinutes < 1 ? '--' : `${Math.round(analytics.avgBreakMinutes)}m`}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl border border-divider">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Punctuality</p>
                  <p className={cn("text-lg font-bold",
                    analytics.punctualityPct >= 90 ? 'text-emerald-500' :
                    analytics.punctualityPct >= 70 ? 'text-amber-500' : 'text-red-500'
                  )}>
                    {analytics.punctualityPct}%
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Day Grid */}
            <div className="bg-card border border-divider rounded-[32px] p-8 space-y-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <Activity size={16} />
                </div>
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
                  {format(currentTime, 'MMMM')} Attendance
                </h3>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: analytics.totalDaysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = format(new Date(currentTime.getFullYear(), currentTime.getMonth(), dayNum), 'yyyy-MM-dd');
                  const rec = analytics.thisMonthRecords.find((r: any) => r.date === dateStr);
                  const isLate = rec?.status === 'LATE';
                  const isToday = dayNum === currentTime.getDate();
                  const isPast = dayNum < currentTime.getDate();

                  return (
                    <div
                      key={dayNum}
                      title={`${format(currentTime, 'MMMM')} ${dayNum}${rec ? ' — ' + rec.status : ''}`}
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center text-[8px] font-black border transition-all",
                        isToday ? "border-primary ring-1 ring-primary/50" : "border-divider/50",
                        rec && !isLate ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                        rec && isLate  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                        isPast         ? "bg-muted/40 text-muted-foreground/30" :
                                         "bg-muted/20 text-muted-foreground/20"
                      )}
                    >
                      {dayNum}
                    </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-emerald-500/30" />
                  <span className="text-[8px] font-black text-muted-foreground/60 uppercase">Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-amber-500/30" />
                  <span className="text-[8px] font-black text-muted-foreground/60 uppercase">Late</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-muted border border-divider" />
                  <span className="text-[8px] font-black text-muted-foreground/60 uppercase">Missing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'calendar' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
           {user?.role === 'ADMIN' && (
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-divider p-6 rounded-[24px] shadow-sm">
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Employee Selection</h3>
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">View history for a specific team member</p>
                </div>
                <CustomSelect
                  value={selectedCalendarEmployee}
                  onChange={setSelectedCalendarEmployee}
                  options={employeeOptions}
                  className="w-full md:w-80 h-11"
                  placeholder="Select employee..."
                />
             </div>
           )}
           <AttendanceCalendar 
             history={calendarHistory} 
             isLoading={loadingCalendar}
             onDayClick={(date, record) => {
               if (user?.role === 'ADMIN') {
                 setSelectedDayRecord(record || { date, userId: selectedCalendarEmployee });
               } else if (record) {
                 toast.success(`Record for ${date} selected`);
               }
             }}
           />
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
          <AttendanceAdminView />
        </div>
      )}

      {/* Day Edit Modal for Calendar */}
      {selectedDayRecord && (
        <EditAttendanceModal
          record={selectedDayRecord?._id ? selectedDayRecord : null}
          onClose={() => setSelectedDayRecord(undefined)}
          onSaved={() => {
             fetchData();
             if (selectedCalendarEmployee !== user?.id) {
               api.get(`/attendance/admin/user/${selectedCalendarEmployee}`).then(res => setCalendarHistory(res.data));
             }
          }}
        />
      )}

      <ExportAttendanceModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        userRole={user?.role}
        currentUserId={user?.id}
        employees={employees}
      />
    </div>
  );
}
